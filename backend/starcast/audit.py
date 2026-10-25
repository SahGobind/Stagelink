"""
StageLink Security Audit Logging System
=======================================
Immutable audit trail recording security events, authentication attempts,
authorization decisions, role alterations, and sensitive operations.
"""

import datetime
import logging
from typing import Optional, Dict, Any, List
from starcast.db import get_collection

logger = logging.getLogger(__name__)

# Fallback in-memory audit log storage for unit testing or when MongoDB is offline
_IN_MEMORY_AUDIT_LOGS = []


def get_audit_col():
    """Retrieve PyMongo collection for audit logs."""
    try:
        return get_collection("audit_logs")
    except Exception:
        return None


def get_client_ip(request) -> str:
    """Extract client IP address handling proxies and direct connections."""
    if not request:
        return "unknown"
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def log_audit_event(
    action: str,
    actor: Optional[Dict[str, Any]] = None,
    resource_type: str = "system",
    resource_id: Optional[str] = None,
    status: str = "SUCCESS",
    details: Optional[Dict[str, Any]] = None,
    request=None,
    reason: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates and records an immutable audit log entry.
    """
    actor_id = "anonymous"
    actor_role = "guest"
    actor_email = ""

    if actor:
        actor_id = actor.get("id") or str(actor.get("_id", "unknown"))
        actor_role = actor.get("role", "guest")
        actor_email = actor.get("email", "")

    ip_address = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "") if request else ""

    event_doc = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "action": action,
        "actor_id": actor_id,
        "actor_role": actor_role,
        "actor_email": actor_email,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "status": status,  # SUCCESS, DENIED, FAILED
        "reason": reason or "",
        "ip_address": ip_address,
        "user_agent": user_agent[:250],
        "details": details or {},
    }

    col = get_audit_col()
    if col is not None:
        try:
            col.insert_one(event_doc.copy())
        except Exception as e:
            logger.warning("Failed to persist audit log in MongoDB: %s", e)
            _IN_MEMORY_AUDIT_LOGS.append(event_doc)
    else:
        _IN_MEMORY_AUDIT_LOGS.append(event_doc)

    logger.info(
        "AUDIT: action=%s status=%s actor=%s(%s) resource=%s:%s ip=%s",
        action, status, actor_id, actor_role, resource_type, resource_id, ip_address
    )
    return event_doc


def query_audit_logs(
    actor_id: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> List[Dict[str, Any]]:
    """
    Queries audit logs from MongoDB Atlas with fallback to in-memory records.
    """
    query: Dict[str, Any] = {}
    if actor_id:
        query["actor_id"] = actor_id
    if action:
        query["action"] = action
    if resource_type:
        query["resource_type"] = resource_type
    if status:
        query["status"] = status

    col = get_audit_col()
    if col is not None:
        try:
            cursor = col.find(query).sort("timestamp", -1).skip(skip).limit(limit)
            from starcast.utils import clean_doc
            return [clean_doc(doc, drop_password=True) for doc in cursor]
        except Exception as e:
            logger.warning("Failed to query audit logs from MongoDB: %s", e)

    # In-memory fallback filtering
    filtered = list(_IN_MEMORY_AUDIT_LOGS)
    if actor_id:
        filtered = [x for x in filtered if x.get("actor_id") == actor_id]
    if action:
        filtered = [x for x in filtered if x.get("action") == action]
    if resource_type:
        filtered = [x for x in filtered if x.get("resource_type") == resource_type]
    if status:
        filtered = [x for x in filtered if x.get("status") == status]

    filtered.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return filtered[skip:skip + limit]
