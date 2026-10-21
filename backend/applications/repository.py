"""
Applications MongoDB Repository
===============================
Data access layer for casting applications, audition requests,
and candidate status tracking in MongoDB Atlas.
"""

import datetime
from bson import ObjectId
from starcast.db import get_collection
from starcast.utils import clean_doc

def get_apps_col():
    return get_collection('applications')

def find_application_by_id(pk: str):
    col = get_apps_col()
    query = {"$or": [{"id": pk}]}
    if ObjectId.is_valid(pk):
        query["$or"].append({"_id": ObjectId(pk)})
    doc = col.find_one(query)
    return clean_doc(doc)

def find_duplicate_application(candidate_id: str, opportunity_id: str):
    col = get_apps_col()
    query = {
        "candidate_id": candidate_id,
        "opportunity_id": opportunity_id,
        "status": {"$ne": "withdrawn"}
    }
    doc = col.find_one(query)
    return clean_doc(doc)

def list_applications(opportunity_id=None, candidate_id=None, status=None):
    col = get_apps_col()
    query = {}
    if opportunity_id:
        query["opportunity_id"] = opportunity_id
    if candidate_id:
        query["candidate_id"] = candidate_id
    if status and status != 'all':
        query["status"] = status

    cursor = col.find(query).sort("applied_date", -1)
    return [clean_doc(doc) for doc in cursor]

def create_application(app_doc: dict):
    col = get_apps_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if not app_doc.get("id"):
        app_doc["id"] = f"app-{int(datetime.datetime.now().timestamp() * 1000)}"
    if not app_doc.get("applied_date"):
        app_doc["applied_date"] = now_iso
    app_doc["created_at"] = now_iso

    col.insert_one(app_doc)

    # Increment applicant_count on casting opportunity
    try:
        opps_col = get_collection('casting_opportunities')
        opps_col.update_one({"id": app_doc.get("opportunity_id")}, {"$inc": {"applicant_count": 1}})
    except Exception:
        pass

    return clean_doc(app_doc)

def update_application(pk: str, updates: dict):
    col = get_apps_col()
    updates["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    query = {"$or": [{"id": pk}]}
    if ObjectId.is_valid(pk):
        query["$or"].append({"_id": ObjectId(pk)})

    col.update_one(query, {"$set": updates})
    doc = col.find_one(query)
    return clean_doc(doc)
