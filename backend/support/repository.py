"""
Support Tickets MongoDB Repository
==================================
Data access layer for Help & Support tickets, replies, internal staff notes,
audit history, Principle of Least Privilege customer context, and Operations metrics in MongoDB Atlas.
"""

import re
import datetime
from bson import ObjectId
from starcast.db import get_collection
from starcast.utils import clean_doc

SUPPORT_ROLES = ["support_agent", "support_lead", "super_admin", "admin", "operations"]
STAFF_NOTE_ROLES = ["support_agent", "support_lead", "super_admin", "admin", "operations"]

DEFAULT_KB_ARTICLES = [
    {
        "id": "kb-1",
        "category": "Verification",
        "title": "Artist Profile Verification Guidelines",
        "summary": "Step-by-step process for reviewing talent identity documents and verification badge criteria.",
        "content": "StageLink verifies talent profiles using official photo ID and active professional reel verification. Standard processing SLA is 24 to 48 hours. Agents must verify that the stage name corresponds to legal identification.",
        "canned_responses": [
            {
                "id": "cr-1",
                "title": "Verification Pending Review",
                "snippet": "Hello! Your verification submission has been received by our security governance team. Standard review takes 24-48 business hours. You will receive an automated notification as soon as verification completes."
            },
            {
                "id": "cr-2",
                "title": "Document Re-upload Required",
                "snippet": "Thank you for reaching out. Upon preliminary review, your submitted proof of identity was unclear or cropped. Please navigate to your Profile > Verification tab and re-upload a clear, high-resolution copy."
            }
        ]
    },
    {
        "id": "kb-2",
        "category": "Casting & Applications",
        "title": "Audition & Self-Tape Submission Policies",
        "summary": "Rules for candidate application deadlines, video uploads, and recruiter audition scheduling.",
        "content": "Applicants may submit self-tapes up until the stated opportunity deadline. If a recruiter requests a reschedule or extended deadline, it must be coordinated through the casting director directly.",
        "canned_responses": [
            {
                "id": "cr-3",
                "title": "Audition Reschedule Request",
                "snippet": "We have logged your request regarding the audition schedule. We are notifying the casting director's production desk and will notify you as soon as they respond."
            },
            {
                "id": "cr-4",
                "title": "Application Status Inquiry",
                "snippet": "Your audition materials were delivered to the production company. Casting directors review applications on a rolling basis. If you are shortlisted, you will receive an in-app message and invitation."
            }
        ]
    },
    {
        "id": "kb-3",
        "category": "Payments & Billing",
        "title": "Listing Fees, Invoicing & Refund Policy",
        "summary": "Guidelines regarding recruiter listing payments, GST/tax invoices, and authorized refund requests.",
        "content": "StageLink processes listing payments via secure escrow gateways. Support agents cannot issue direct cash refunds; all refund requests must be escalated to the Support Lead or Billing Administration for approval.",
        "canned_responses": [
            {
                "id": "cr-5",
                "title": "Tax Invoice Dispatch",
                "snippet": "You can download your official GST / VAT tax invoice from your Billing & Invoices section. If you require updated company details on the invoice, please provide your legal tax registration number."
            },
            {
                "id": "cr-6",
                "title": "Refund Escalation Notice",
                "snippet": "Your refund request has been escalated to our Senior Billing Operations team for review under the StageLink Terms of Service. A billing specialist will contact you within 1 business day."
            }
        ]
    },
    {
        "id": "kb-4",
        "category": "Account & Security",
        "title": "Password Reset & Account Recovery",
        "summary": "Assisting users with login lockouts, email changes, and 2FA authentication issues.",
        "content": "Users can initiate a self-service password reset using their registered email. For account recovery involving changed email addresses, verification of identity is required before updating credentials.",
        "canned_responses": [
            {
                "id": "cr-7",
                "title": "Self-Service Password Reset",
                "snippet": "To reset your StageLink credentials, please visit /forgot-password and enter your registered email address. A cryptographically signed recovery link will be dispatched immediately."
            }
        ]
    }
]

def get_tickets_col():
    return get_collection('support_tickets')

def sanitize_ticket_for_user(ticket: dict, role: str):
    """
    Ensures internal staff notes are strictly hidden from candidate and recruiter callers.
    Only authorized support and admin roles may see internal notes.
    """
    if not ticket:
        return ticket
    sanitized = dict(ticket)
    if role not in STAFF_NOTE_ROLES:
        sanitized["notes"] = []
    return sanitized

def find_ticket_by_id(ticket_id: str):
    col = get_tickets_col()
    query = {"$or": [{"id": ticket_id}, {"ticket_number": ticket_id}]}
    if ObjectId.is_valid(ticket_id):
        query["$or"].append({"_id": ObjectId(ticket_id)})
    doc = col.find_one(query)
    return clean_doc(doc)

def get_next_ticket_number() -> str:
    """Computes next sequential ticket number from MongoDB records."""
    col = get_tickets_col()
    latest = col.find_one(
        {"ticket_number": {"$regex": r"^STG-\d+$"}},
        sort=[("ticket_number", -1)]
    )
    if latest and latest.get("ticket_number"):
        try:
            num = int(latest["ticket_number"].split("-")[1])
            return f"STG-{num + 1}"
        except (IndexError, ValueError):
            pass
    count = col.count_documents({})
    return f"STG-{1001 + count}"

def list_tickets(
    role="candidate",
    user_id="",
    user_name="",
    status_filter="",
    user_type_filter="",
    search="",
    category="",
    priority_filter="",
    assigned_filter=""
):
    col = get_tickets_col()
    query = {}

    # Authorization filtering & Principle of Least Privilege
    if role == "support_agent":
        # Support agents MUST ONLY access tickets assigned to them
        or_conds = []
        if user_id:
            or_conds.append({"assigned_staff_id": user_id})
        if user_name:
            or_conds.append({"assigned_to": user_name})
        if or_conds:
            query["$or"] = or_conds
        else:
            query["assigned_staff_id"] = "NO_ASSIGNMENT"
    elif role in ["support_lead", "super_admin", "admin", "operations"]:
        # Support Leads and Administrators can view all tickets or filter by assignment
        if assigned_filter:
            if assigned_filter == "me" and (user_id or user_name):
                or_conds = []
                if user_id:
                    or_conds.append({"assigned_staff_id": user_id})
                if user_name:
                    or_conds.append({"assigned_to": user_name})
                if or_conds:
                    query["$or"] = or_conds
            elif assigned_filter == "unassigned":
                query["$or"] = [
                    {"assigned_staff_id": {"$in": ["", None]}},
                    {"assigned_to": {"$in": ["Unassigned", "", None]}}
                ]
            else:
                query["$or"] = [
                    {"assigned_staff_id": assigned_filter},
                    {"assigned_to": assigned_filter}
                ]
    elif role == "recruiter":
        cond = [{"user_role": {"$in": ["recruiter", "admin"]}}]
        if user_id:
            cond.append({"user_id": user_id})
        query["$and"] = cond
    else:
        # Candidate / Talent
        cond = [{"user_role": "candidate"}]
        if user_id:
            cond.append({"user_id": user_id})
        query["$and"] = cond

    # User type filter
    if user_type_filter and user_type_filter != "all":
        if "$and" not in query:
            query["$and"] = []
        if user_type_filter in ["candidate", "candidates"]:
            query["$and"].append({"user_role": "candidate"})
        elif user_type_filter in ["recruiter", "recruiters", "production"]:
            query["$and"].append({"user_role": {"$in": ["recruiter", "admin"]}})

    # Status filter
    if status_filter and status_filter != "all":
        if "$and" not in query:
            query["$and"] = []
        if status_filter == "new":
            query["$and"].append({"status": "open", "unread_for_staff": True})
        elif status_filter == "escalated":
            query["$and"].append({"status": "escalated"})
        else:
            query["$and"].append({"status": status_filter})

    # Priority filter
    if priority_filter and priority_filter != "all":
        if "$and" not in query:
            query["$and"] = []
        query["$and"].append({"priority": priority_filter.lower()})

    # Category filter
    if category and category != "all":
        if "$and" not in query:
            query["$and"] = []
        query["$and"].append({"category": {"$regex": f"^{re.escape(category)}$", "$options": "i"}})

    # Search filter
    if search:
        if "$and" not in query:
            query["$and"] = []
        regex = re.compile(re.escape(search), re.IGNORECASE)
        query["$and"].append({
            "$or": [
                {"ticket_number": regex},
                {"subject": regex},
                {"user_name": regex},
                {"user_email": regex},
                {"company_name": regex},
                {"category": regex}
            ]
        })

    cursor = col.find(query).sort("last_reply_at", -1)
    return [clean_doc(doc) for doc in cursor]

def create_ticket(ticket_doc: dict):
    col = get_tickets_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if not ticket_doc.get("ticket_number"):
        ticket_doc["ticket_number"] = get_next_ticket_number()
    if not ticket_doc.get("id"):
        ticket_doc["id"] = ticket_doc["ticket_number"]
    ticket_doc["created_at"] = now_iso
    ticket_doc["last_reply_at"] = now_iso

    col.insert_one(ticket_doc)
    return clean_doc(ticket_doc)

def update_ticket(ticket_id: str, updates: dict):
    col = get_tickets_col()
    query = {"$or": [{"id": ticket_id}, {"ticket_number": ticket_id}]}
    if ObjectId.is_valid(ticket_id):
        query["$or"].append({"_id": ObjectId(ticket_id)})

    col.update_one(query, {"$set": updates})
    doc = col.find_one(query)
    return clean_doc(doc)

def add_message_to_ticket(ticket_id: str, message: dict, updates: dict, history_event: dict = None):
    col = get_tickets_col()
    query = {"$or": [{"id": ticket_id}, {"ticket_number": ticket_id}]}
    if ObjectId.is_valid(ticket_id):
        query["$or"].append({"_id": ObjectId(ticket_id)})

    update_payload = {
        "$push": {"messages": message},
        "$set": updates
    }
    if history_event:
        update_payload["$push"]["history"] = history_event

    col.update_one(query, update_payload)
    doc = col.find_one(query)
    return clean_doc(doc)

def add_note_to_ticket(ticket_id: str, note_entry: dict, history_event: dict):
    col = get_tickets_col()
    query = {"$or": [{"id": ticket_id}, {"ticket_number": ticket_id}]}
    if ObjectId.is_valid(ticket_id):
        query["$or"].append({"_id": ObjectId(ticket_id)})

    col.update_one(
        query,
        {
            "$push": {
                "notes": note_entry,
                "history": history_event
            }
        }
    )
    doc = col.find_one(query)
    return clean_doc(doc)

def assign_ticket(ticket_id: str, assigned_staff_id: str, assigned_to_name: str, actor_name: str):
    """Assigns or reassigns ticket to a support staff member and logs history."""
    col = get_tickets_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    history_event = {
        "event": f"Assigned to {assigned_to_name}",
        "timestamp": now_iso,
        "actor": actor_name
    }
    updates = {
        "assigned_staff_id": assigned_staff_id,
        "assigned_to": assigned_to_name,
        "status": "assigned"
    }
    return update_ticket(ticket_id, {
        **updates,
        "$push": {"history": history_event}
    })

def escalate_ticket(ticket_id: str, reason: str, actor_name: str, new_priority: str = None):
    """Escalates ticket to Tier-2 / Lead attention."""
    col = get_tickets_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    history_event = {
        "event": f"Ticket escalated: {reason}",
        "timestamp": now_iso,
        "actor": actor_name
    }
    updates = {
        "status": "escalated",
        "unread_for_staff": True
    }
    if new_priority:
        updates["priority"] = new_priority.lower()

    query = {"$or": [{"id": ticket_id}, {"ticket_number": ticket_id}]}
    if ObjectId.is_valid(ticket_id):
        query["$or"].append({"_id": ObjectId(ticket_id)})

    col.update_one(query, {
        "$set": updates,
        "$push": {"history": history_event}
    })
    doc = col.find_one(query)
    return clean_doc(doc)

def get_customer_context(user_id: str, ticket_user_email: str = "") -> dict:
    """
    Returns minimal customer context strictly following the Principle of Least Privilege (PoLP).
    NEVER exposes passwords, password hashes, security questions, credit cards, or full identity proofs.
    """
    users_col = get_collection('users')
    tickets_col = get_tickets_col()
    
    query = {}
    if user_id:
        query["$or"] = [{"id": user_id}]
        if ObjectId.is_valid(user_id):
            query["$or"].append({"_id": ObjectId(user_id)})
    elif ticket_user_email:
        query["email"] = ticket_user_email.strip().lower()

    user_doc = users_col.find_one(query) if query else None

    # Calculate ticket statistics for this customer
    user_tickets_q = {"$or": [{"user_id": user_id}]} if user_id else {"user_email": ticket_user_email}
    user_tickets = list(tickets_col.find(user_tickets_q).sort("created_at", -1).limit(5))

    total_tickets = tickets_col.count_documents(user_tickets_q)
    resolved_tickets = tickets_col.count_documents({**user_tickets_q, "status": {"$in": ["resolved", "closed"]}})
    open_tickets = tickets_col.count_documents({**user_tickets_q, "status": {"$in": ["open", "in_progress", "waiting_user", "escalated"]}})

    # Recent tickets overview (minimal fields)
    recent_history = [
        {
            "id": t.get("ticket_number") or t.get("id"),
            "subject": t.get("subject"),
            "status": t.get("status"),
            "priority": t.get("priority"),
            "created_at": t.get("created_at")
        }
        for t in user_tickets
    ]

    # Additional read-only reference activity based on role
    ref_activity = {}
    if user_doc:
        role = user_doc.get("role", "candidate")
        if role in ["candidate", "talent"]:
            app_col = get_collection("applications")
            app_count = app_col.count_documents({"candidate_id": user_doc.get("id")})
            ref_activity["applications_count"] = app_count
        elif role in ["recruiter", "production"]:
            opp_col = get_collection("opportunities")
            opp_count = opp_col.count_documents({"recruiter_id": user_doc.get("id")})
            ref_activity["published_casting_calls"] = opp_count

    return {
        "customer": {
            "id": user_doc.get("id") if user_doc else user_id,
            "full_name": (user_doc.get("fullName") or user_doc.get("full_name") or "StageLink Member") if user_doc else "StageLink Member",
            "email": (user_doc.get("email") or ticket_user_email) if user_doc else ticket_user_email,
            "role": user_doc.get("role", "candidate") if user_doc else "candidate",
            "status": user_doc.get("status", "active") if user_doc else "active",
            "verification_status": user_doc.get("verification_status", "unverified") if user_doc else "unverified",
            "created_at": user_doc.get("createdAt") or user_doc.get("created_at") if user_doc else None,
            "location": user_doc.get("location") if user_doc else "Not specified",
            "avatar": user_doc.get("avatar") if user_doc else None,
            "phone_masked": (user_doc.get("phoneNumber") or user_doc.get("phone_number") or "")[:4] + "****" if (user_doc and (user_doc.get("phoneNumber") or user_doc.get("phone_number"))) else "None on file",
        },
        "stats": {
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets,
        },
        "recent_tickets": recent_history,
        "reference_activity": ref_activity,
        "security_notice": "Principle of Least Privilege enforced. Sensitive payment credentials and identity documents are withheld from support view."
    }

def get_support_team_members():
    """
    Returns list of support staff (agents and leads) with their active workloads.
    Accessible only to Support Lead and Super Admin.
    """
    users_col = get_collection('users')
    tickets_col = get_tickets_col()

    # Find staff with support roles or operations roles
    staff_cursor = users_col.find(
        {"role": {"$in": ["support_agent", "support_lead", "operations", "admin"]}},
        {"password_hash": 0, "password": 0, "token_secret": 0}
    )
    staff_list = [clean_doc(doc) for doc in staff_cursor]

    # If no support_agent in DB yet, include standard known seeded staff members
    existing_ids = {s.get("id") for s in staff_list}
    fallback_staff = [
        {
            "id": "supp-agent-1",
            "fullName": "Liam Patel (Support Agent)",
            "email": "agent@stagelink.com",
            "role": "support_agent",
            "status": "active",
            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
        },
        {
            "id": "supp-lead-1",
            "fullName": "Elena Rostova (Support Lead)",
            "email": "lead@stagelink.com",
            "role": "support_lead",
            "status": "active",
            "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
        }
    ]
    for fb in fallback_staff:
        if fb["id"] not in existing_ids:
            staff_list.append(fb)

    # Attach live ticket stats to each staff member
    for member in staff_list:
        mid = member.get("id")
        name = member.get("fullName") or member.get("full_name") or ""
        cond = {"$or": [{"assigned_staff_id": mid}, {"assigned_to": name}]}
        
        active_count = tickets_col.count_documents({
            **cond,
            "status": {"$in": ["open", "assigned", "in_progress", "waiting_user", "escalated"]}
        })
        resolved_count = tickets_col.count_documents({
            **cond,
            "status": {"$in": ["resolved", "closed"]}
        })
        member["active_tickets_count"] = active_count
        member["resolved_tickets_count"] = resolved_count
        member["workload_level"] = "high" if active_count >= 8 else ("medium" if active_count >= 4 else "normal")

    return staff_list

def get_metrics_counts(role: str = "operations", user_id: str = "", user_name: str = ""):
    col = get_tickets_col()

    if role == "support_agent":
        # Personal metrics for Level 1 Support Agent
        agent_cond = []
        if user_id:
            agent_cond.append({"assigned_staff_id": user_id})
        if user_name:
            agent_cond.append({"assigned_to": user_name})
        base_q = {"$or": agent_cond} if agent_cond else {"assigned_staff_id": "NONE"}

        my_total = col.count_documents(base_q)
        my_open = col.count_documents({**base_q, "status": {"$in": ["open", "assigned"]}})
        my_in_progress = col.count_documents({**base_q, "status": "in_progress"})
        my_waiting = col.count_documents({**base_q, "status": "waiting_user"})
        my_escalated = col.count_documents({**base_q, "status": "escalated"})
        my_resolved = col.count_documents({**base_q, "status": {"$in": ["resolved", "closed"]}})

        return {
            "mode": "personal_support_agent",
            "my_total": my_total,
            "my_open": my_open,
            "my_in_progress": my_in_progress,
            "my_waiting": my_waiting,
            "my_escalated": my_escalated,
            "my_resolved": my_resolved,
            "active_tickets": my_open + my_in_progress + my_waiting,
        }

    # Support Lead / Super Admin / Operations full team-wide metrics
    total_tickets = col.count_documents({})
    new_tickets = col.count_documents({"status": "open", "unread_for_staff": True})
    open_tickets = col.count_documents({"status": {"$in": ["open", "assigned", "in_progress"]}})
    in_progress = col.count_documents({"status": "in_progress"})
    waiting_for_user = col.count_documents({"status": "waiting_user"})
    escalated_tickets = col.count_documents({"status": "escalated"})
    resolved_tickets = col.count_documents({"status": {"$in": ["resolved", "closed"]}})
    urgent_tickets = col.count_documents({"priority": {"$in": ["urgent", "high"]}, "status": {"$ne": "resolved"}})

    candidates_count = col.count_documents({"user_role": "candidate"})
    recruiters_count = col.count_documents({"user_role": {"$in": ["recruiter", "admin"]}})

    # Category breakdown
    categories_breakdown = {}
    if hasattr(col, "aggregate"):
        try:
            categories_agg = col.aggregate([
                {"$group": {"_id": "$category", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ])
            categories_breakdown = {item["_id"] or "Uncategorized": item["count"] for item in categories_agg}
        except Exception:
            pass

    # Priority breakdown
    priority_breakdown = {}
    if hasattr(col, "aggregate"):
        try:
            priority_agg = col.aggregate([
                {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
            ])
            priority_breakdown = {item["_id"] or "normal": item["count"] for item in priority_agg}
        except Exception:
            pass

    return {
        "mode": "team_wide",
        "total_tickets": total_tickets,
        "new_tickets": new_tickets,
        "open_tickets": open_tickets,
        "in_progress": in_progress,
        "waiting_for_user": waiting_for_user,
        "escalated_tickets": escalated_tickets,
        "resolved_tickets": resolved_tickets,
        "urgent_tickets": urgent_tickets,
        "candidates_count": candidates_count,
        "recruiters_count": recruiters_count,
        "categories_breakdown": categories_breakdown,
        "priority_breakdown": priority_breakdown,
    }
