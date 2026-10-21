"""
Users and Talent Profiles MongoDB Repository
============================================
Data access layer for StageLink user accounts, authentication records,
and talent profile documents in MongoDB Atlas.
"""

import re
import datetime
from bson import ObjectId
from starcast.db import get_collection
from starcast.utils import clean_doc

def get_users_col():
    return get_collection('users')

def get_profiles_col():
    return get_collection('talent_profiles')

def find_user_by_id(user_id: str):
    col = get_users_col()
    query = {"$or": [{"id": user_id}]}
    if ObjectId.is_valid(user_id):
        query["$or"].append({"_id": ObjectId(user_id)})
    doc = col.find_one(query)
    return clean_doc(doc, drop_password=False)

def find_user_by_email(email: str):
    if not email:
        return None
    col = get_users_col()
    regex = re.compile(f"^{re.escape(email.strip())}$", re.IGNORECASE)
    doc = col.find_one({"$or": [{"email": regex}, {"secondary_email": regex}]})
    return clean_doc(doc, drop_password=False)

def list_users(role: str = None):
    col = get_users_col()
    query = {}
    if role:
        # Match role flexibly (e.g. 'candidate' or 'talent')
        if role in ('candidate', 'talent'):
            query["role"] = {"$in": ["candidate", "talent"]}
        else:
            query["role"] = role
    cursor = col.find(query).sort("created_at", -1)
    return [clean_doc(doc, drop_password=True) for doc in cursor]

def create_user(user_dict: dict):
    col = get_users_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if 'created_at' not in user_dict:
        user_dict['created_at'] = now_iso
    user_dict['updated_at'] = now_iso
    res = col.insert_one(user_dict)
    if 'id' not in user_dict:
        col.update_one({"_id": res.inserted_id}, {"$set": {"id": str(res.inserted_id)}})
        user_dict['id'] = str(res.inserted_id)

    # If talent or candidate, initialize talent profile
    if user_dict.get('role') in ('talent', 'candidate'):
        profiles_col = get_profiles_col()
        profiles_col.update_one(
            {"user_id": user_dict['id']},
            {"$setOnInsert": {
                "user_id": user_dict['id'],
                "full_name": user_dict.get('full_name', ''),
                "category": user_dict.get('category', 'Actor'),
                "headline": user_dict.get('headline', 'Professional Talent'),
                "location": user_dict.get('location', 'Remote / Worldwide'),
                "skills": user_dict.get('skills', []),
                "languages": user_dict.get('languages', ['English']),
                "years_of_experience": user_dict.get('years_of_experience', 0),
                "availability_status": user_dict.get('availability_status', 'Available'),
                "portfolio": user_dict.get('portfolio', {}),
                "review_status": "pending_review",
                "created_at": now_iso
            }},
            upsert=True
        )

    return clean_doc(user_dict, drop_password=True)

def update_user(user_id: str, updates: dict):
    col = get_users_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    updates['updated_at'] = now_iso
    query = {"$or": [{"id": user_id}]}
    if ObjectId.is_valid(user_id):
        query["$or"].append({"_id": ObjectId(user_id)})
    
    col.update_one(query, {"$set": updates})
    updated = col.find_one(query)
    return clean_doc(updated, drop_password=True)

def get_talent_profile(user_id: str):
    col = get_profiles_col()
    doc = col.find_one({"user_id": user_id})
    return clean_doc(doc)

def update_talent_profile(user_id: str, profile_data: dict):
    col = get_profiles_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    profile_data['updated_at'] = now_iso
    col.update_one(
        {"user_id": user_id},
        {"$set": profile_data},
        upsert=True
    )
    doc = col.find_one({"user_id": user_id})
    return clean_doc(doc)
