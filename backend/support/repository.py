"""
Support Tickets MongoDB Repository
==================================
Data access layer for Help & Support tickets, replies, internal staff notes,
audit history, and Operations metrics in MongoDB Atlas.
"""

import re
import datetime
from bson import ObjectId
from starcast.db import get_collection
from starcast.utils import clean_doc

def get_tickets_col():
    return get_collection('support_tickets')

def sanitize_ticket_for_user(ticket: dict, role: str):
    """
    Ensures internal staff notes are strictly hidden from candidate and recruiter callers.
    """
    if not ticket:
        return ticket
    sanitized = dict(ticket)
    if role not in ["operations", "admin"]:
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

def list_tickets(role="candidate", user_id="", status_filter="", user_type_filter="", search="", category=""):
    col = get_tickets_col()
    query = {}

    # Authorization filtering
    if role in ["operations", "admin"]:
        # Staff can view all tickets
        pass
    elif role == "recruiter":
        cond = [{"user_role": {"$in": ["recruiter", "admin"]}}]
        if user_id:
            cond.append({"user_id": user_id})
        query["$and"] = cond
    else:
        # Candidate
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
        else:
            query["$and"].append({"status": status_filter})

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

def get_metrics_counts():
    col = get_tickets_col()
    total_tickets = col.count_documents({})
    new_tickets = col.count_documents({"status": "open", "unread_for_staff": True})
    open_tickets = col.count_documents({"status": {"$in": ["open", "in_progress"]}})
    waiting_for_user = col.count_documents({"status": "waiting_user"})
    resolved_tickets = col.count_documents({"status": {"$in": ["resolved", "closed"]}})
    candidates_count = col.count_documents({"user_role": "candidate"})
    recruiters_count = col.count_documents({"user_role": {"$in": ["recruiter", "admin"]}})

    return {
        "new_tickets": new_tickets,
        "open_tickets": open_tickets,
        "waiting_for_user": waiting_for_user,
        "resolved_tickets": resolved_tickets,
        "total_tickets": total_tickets,
        "candidates_count": candidates_count,
        "recruiters_count": recruiters_count,
    }
