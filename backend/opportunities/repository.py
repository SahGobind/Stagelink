"""
Casting Opportunities MongoDB Repository
========================================
Data access layer for casting calls, roles, publication workflows,
and moderation in MongoDB Atlas.
"""

import re
import datetime
from bson import ObjectId
from starcast.db import get_collection
from starcast.utils import clean_doc

def get_opps_col():
    return get_collection('casting_opportunities')

def find_opportunity_by_id(pk: str):
    col = get_opps_col()
    query = {"$or": [{"id": pk}, {"refId": pk}]}
    if ObjectId.is_valid(pk):
        query["$or"].append({"_id": ObjectId(pk)})
    doc = col.find_one(query)
    return clean_doc(doc)

def list_public_opportunities(category=None, location=None, search=None):
    col = get_opps_col()
    query = {
        "$and": [
            {"$or": [
                {"status": {"$in": ["published", "open", "active"]}},
                {"listingStatus": {"$in": ["published", "open"]}}
            ]},
            {"status": {"$nin": ["draft", "pending_payment", "pending_review", "rejected", "archived"]}},
            {"listingStatus": {"$nin": ["draft", "pending_payment", "pending_review", "rejected", "archived"]}}
        ]
    }

    if category and category != 'all':
        cat_regex = re.compile(re.escape(category), re.IGNORECASE)
        query["$and"].append({"$or": [{"category": cat_regex}, {"productionCategory": cat_regex}]})
    
    if location and location != 'all':
        loc_regex = re.compile(re.escape(location), re.IGNORECASE)
        query["$and"].append({"location": loc_regex})

    if search:
        search_regex = re.compile(re.escape(search), re.IGNORECASE)
        query["$and"].append({
            "$or": [
                {"title": search_regex},
                {"production_company": search_regex},
                {"productionCompany": search_regex}
            ]
        })

    cursor = col.find(query).sort("created_at", -1)
    return [clean_doc(doc) for doc in cursor]

def list_all_opportunities():
    col = get_opps_col()
    cursor = col.find().sort("created_at", -1)
    return [clean_doc(doc) for doc in cursor]

def list_pending_moderation():
    col = get_opps_col()
    query = {"$or": [{"status": "pending_review"}, {"listingStatus": "pending_review"}]}
    cursor = col.find(query).sort("created_at", -1)
    return [clean_doc(doc) for doc in cursor]

def save_opportunity(opp_doc: dict):
    col = get_opps_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    opp_id = opp_doc.get("id")
    if not opp_id:
        opp_id = f"opp-{int(datetime.datetime.now().timestamp() * 1000)}"
        opp_doc["id"] = opp_id
    
    opp_doc["updated_at"] = now_iso
    col.update_one({"id": opp_id}, {"$set": opp_doc}, upsert=True)
    doc = col.find_one({"id": opp_id})
    return clean_doc(doc)

def update_opportunity_status(pk: str, new_status: str, extra_fields: dict = None):
    col = get_opps_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    updates = {
        "status": new_status,
        "listingStatus": new_status,
        "updated_at": now_iso
    }
    if extra_fields:
        updates.update(extra_fields)

    query = {"$or": [{"id": pk}, {"refId": pk}]}
    if ObjectId.is_valid(pk):
        query["$or"].append({"_id": ObjectId(pk)})

    col.update_one(query, {"$set": updates})
    doc = col.find_one(query)
    return clean_doc(doc)
