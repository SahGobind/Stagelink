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
    clean_email = email.strip().lower()
    # 1. Fast indexed exact match lookup (<1ms)
    doc = col.find_one({"email": clean_email})
    if doc:
        return clean_doc(doc, drop_password=False)
    # 2. Fallback to secondary email or case-insensitive regex
    regex = re.compile(f"^{re.escape(clean_email)}$", re.IGNORECASE)
    doc = col.find_one({"$or": [{"email": regex}, {"secondary_email": regex}]})
    return clean_doc(doc, drop_password=False)

def find_user_by_email_or_phone(identifier: str):
    if not identifier:
        return None
    col = get_users_col()
    clean_id = identifier.strip().lower()
    # 1. Fast indexed exact match check
    doc = col.find_one({"email": clean_id})
    if doc:
        return clean_doc(doc, drop_password=False)
    
    # 2. Check exact phone number match
    phone_digits = re.sub(r'[^0-9]', '', clean_id)
    if phone_digits:
        doc = col.find_one({"$or": [{"phoneNumber": clean_id}, {"phone_number": clean_id}]})
        if doc:
            return clean_doc(doc, drop_password=False)

    # 3. Fallback regex search
    regex = re.compile(f"^{re.escape(clean_id)}$", re.IGNORECASE)
    or_clauses = [
        {"email": regex},
        {"secondary_email": regex},
    ]
    if phone_digits:
        phone_regex = re.compile(re.escape(phone_digits))
        or_clauses.extend([
            {"phoneNumber": {"$regex": phone_regex}},
            {"phone_number": {"$regex": phone_regex}},
        ])
    doc = col.find_one({"$or": or_clauses})
    return clean_doc(doc, drop_password=False)

def get_merged_candidate(user_id: str):
    """
    Fetch user and their talent profile from MongoDB Atlas, merging all
    profile fields (portfolio, bio, categories, headshots, etc.) into a unified document.
    """
    user = find_user_by_id(user_id)
    if not user:
        return None
    
    clean_user = clean_doc(user, drop_password=True)
    if clean_user.get("role") in ("candidate", "talent"):
        prof = get_talent_profile(clean_user["id"])
        if prof:
            for k, v in prof.items():
                if k not in clean_user or clean_user[k] is None or clean_user[k] == "" or clean_user[k] == []:
                    clean_user[k] = v
                elif isinstance(v, dict) and isinstance(clean_user.get(k), dict):
                    merged_dict = {**clean_user[k], **v}
                    clean_user[k] = merged_dict
        
        # Harmonize dual camelCase & snake_case fields
        full_name = clean_user.get("full_name") or clean_user.get("fullName") or ""
        clean_user["full_name"] = full_name
        clean_user["fullName"] = full_name

        avatar = clean_user.get("avatar") or clean_user.get("profile_photo") or ""
        clean_user["avatar"] = avatar
        clean_user["profile_photo"] = avatar

        # Ensure categories list and primary category
        categories = clean_user.get("categories") or []
        primary_cat = clean_user.get("category") or (categories[0] if categories else "Actor")
        if not categories:
            categories = [primary_cat]
        clean_user["category"] = primary_cat
        clean_user["categories"] = categories

        headline = clean_user.get("headline") or (f"{primary_cat} • Professional Talent")
        clean_user["headline"] = headline

        # Ensure location fields
        loc = clean_user.get("location") or "Mumbai, India"
        clean_user["location"] = loc
        if "city" not in clean_user or not clean_user["city"]:
            clean_user["city"] = loc.split(",")[0].strip() if "," in loc else loc
        if "country" not in clean_user or not clean_user["country"]:
            clean_user["country"] = loc.split(",")[1].strip() if "," in loc else "India"

        # Ensure portfolio object structure
        port = clean_user.get("portfolio") or {}
        if not isinstance(port, dict):
            port = {}
        if "headshots" not in port or not port["headshots"]:
            port["headshots"] = [avatar] if avatar else []

        # Ensure showreel format in portfolio
        if "showreel" not in port or not port["showreel"]:
            vid = port.get("video_reel") or port.get("video_audition_url") or clean_user.get("video_audition_url")
            if vid:
                port["showreel"] = {"url": vid, "title": "Performance Showreel"}
        elif isinstance(port["showreel"], str):
            port["showreel"] = {"url": port["showreel"], "title": "Performance Showreel"}

        # Ensure instagram handle is harmonized
        insta = clean_user.get("instagram") or port.get("instagram") or ""
        clean_user["instagram"] = insta
        port["instagram"] = insta

        clean_user["portfolio"] = port

        # Publication status
        is_pub = clean_user.get("is_published")
        if is_pub is None:
            # Legacy seed candidates with approved status are published by default
            if clean_user.get("id") in ("cand-aanya", "usr-1", "cand-sophia", "cand-rohit") or clean_user.get("review_status") in ("approved", "verified"):
                clean_user["is_published"] = True
            else:
                clean_user["is_published"] = False
        else:
            clean_user["is_published"] = bool(is_pub)

    return clean_user

def validate_profile_completion(data: dict) -> tuple[bool, list, list]:
    """
    Validates required StageLink performer profile fields before publication.
    Returns (is_valid, missing_field_keys, missing_field_labels).
    """
    missing_keys = []
    missing_labels = []

    full_name = data.get("fullName") or data.get("full_name")
    if not full_name or len(str(full_name).strip()) < 2:
        missing_keys.append("fullName")
        missing_labels.append("Full Stage Name")

    headline = data.get("headline")
    if not headline or len(str(headline).strip()) < 2:
        missing_keys.append("headline")
        missing_labels.append("Professional Headline")

    category = data.get("category")
    categories = data.get("categories")
    if not category and (not categories or len(categories) == 0):
        missing_keys.append("categories")
        missing_labels.append("Talent Category")

    location = data.get("location") or data.get("city")
    if not location or len(str(location).strip()) < 2:
        missing_keys.append("location")
        missing_labels.append("Primary Location")

    bio = data.get("bio")
    if not bio or len(str(bio).strip()) < 10:
        missing_keys.append("bio")
        missing_labels.append("Performer Bio (minimum 10 characters)")

    skills = data.get("skills")
    if not skills or not isinstance(skills, list) or len(skills) == 0:
        missing_keys.append("skills")
        missing_labels.append("Performance Skills (at least 1)")

    languages = data.get("languages")
    if not languages or not isinstance(languages, list) or len(languages) == 0:
        missing_keys.append("languages")
        missing_labels.append("Languages (at least 1)")

    avatar = data.get("avatar") or data.get("profile_photo")
    portfolio = data.get("portfolio") or {}
    headshots = portfolio.get("headshots", []) if isinstance(portfolio, dict) else []
    if not avatar and (not headshots or len(headshots) == 0):
        missing_keys.append("avatar")
        missing_labels.append("Profile Photo or Portfolio Headshot")

    is_valid = len(missing_keys) == 0
    return is_valid, missing_keys, missing_labels

def update_candidate_full_profile(user_id: str, data: dict, publish: bool = None):
    """
    Saves candidate profile updates consistently across both MongoDB Atlas
    collections: 'users' and 'talent_profiles'.
    """
    user_col = get_users_col()
    prof_col = get_profiles_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    user_query = {"$or": [{"id": user_id}]}
    if ObjectId.is_valid(user_id):
        user_query["$or"].append({"_id": ObjectId(user_id)})
    
    existing_user = user_col.find_one(user_query)
    if not existing_user:
        return None

    target_uid = existing_user.get("id") or str(existing_user["_id"])

    # Harmonize keys
    full_name = data.get("fullName") or data.get("full_name") or existing_user.get("full_name") or existing_user.get("fullName")
    headline = data.get("headline") or existing_user.get("headline")
    bio = data.get("bio") if "bio" in data else existing_user.get("bio", "")
    location = data.get("location") or existing_user.get("location")
    city = data.get("city") or (location.split(",")[0].strip() if location and "," in location else location)
    country = data.get("country") or (location.split(",")[1].strip() if location and "," in location else "India")
    avatar = data.get("avatar") or data.get("profilePhoto") or data.get("profile_photo") or existing_user.get("avatar")
    
    categories = data.get("categories") or existing_user.get("categories") or []
    category = data.get("category") or (categories[0] if categories else existing_user.get("category", "Actor"))
    if category and not categories:
        categories = [category]

    skills = data.get("skills") if "skills" in data else existing_user.get("skills", [])
    languages = data.get("languages") if "languages" in data else existing_user.get("languages", ["English"])
    
    years_exp = data.get("years_of_experience")
    if years_exp is None:
        years_exp = data.get("yearsOfExperience")
    if years_exp is None and "experienceYears" in data:
        # e.g. "2+" -> 2
        try:
            years_exp = int(re.sub(r'[^0-9]', '', str(data["experienceYears"])))
        except (ValueError, TypeError):
            years_exp = 2
    if years_exp is None:
        years_exp = existing_user.get("years_of_experience", 2)

    avail = data.get("availability_status") or data.get("availabilityStatus") or data.get("availability") or existing_user.get("availability_status", "Available for Projects")

    # Portfolio handling
    existing_prof = prof_col.find_one({"$or": [{"user_id": target_uid}, {"user_id": user_id}]}) or {}
    existing_port = existing_prof.get("portfolio") or existing_user.get("portfolio") or {}
    new_port = data.get("portfolio")
    if new_port is None:
        new_port = {}

    if isinstance(new_port, list):
        merged_port = {
            "headshots": [item for item in new_port if isinstance(item, str)],
            "images": [item for item in new_port if isinstance(item, str)],
            "videos": [],
            "audio": []
        }
        if isinstance(existing_port, dict):
            for k, v in existing_port.items():
                if k not in merged_port or not merged_port[k]:
                    merged_port[k] = v
    elif isinstance(new_port, dict):
        merged_port = {**existing_port, **new_port} if isinstance(existing_port, dict) else dict(new_port)
    else:
        merged_port = dict(existing_port) if isinstance(existing_port, dict) else {}

    # Sync showreel to video_reel and video_audition_url for full backwards-compatibility
    if isinstance(merged_port.get("showreel"), dict) and merged_port["showreel"].get("url"):
        merged_port["video_reel"] = merged_port["showreel"]["url"]
        merged_port["video_audition_url"] = merged_port["showreel"]["url"]
    elif isinstance(merged_port.get("showreel"), str) and merged_port["showreel"]:
        merged_port["video_reel"] = merged_port["showreel"]
        merged_port["video_audition_url"] = merged_port["showreel"]

    # Also keep instagram in portfolio if present
    if "instagram" in data:
        merged_port["instagram"] = data["instagram"]

    if avatar:
        if not isinstance(merged_port.get("headshots"), list):
            merged_port["headshots"] = []
        if avatar not in merged_port["headshots"]:
            merged_port["headshots"].insert(0, avatar)
    elif merged_port.get("headshots") and len(merged_port["headshots"]) > 0:
        avatar = merged_port["headshots"][0]

    user_updates = {
        "full_name": full_name,
        "fullName": full_name,
        "headline": headline,
        "location": location,
        "city": city,
        "country": country,
        "category": category,
        "categories": categories,
        "avatar": avatar,
        "skills": skills,
        "languages": languages,
        "years_of_experience": years_exp,
        "availability_status": avail,
        "availability": avail,
        "bio": bio,
        "portfolio": merged_port,
        "updated_at": now_iso,
    }

    if "phone" in data or "phoneNumber" in data or "phone_number" in data:
        p_val = data.get("phone") or data.get("phoneNumber") or data.get("phone_number")
        user_updates["phone"] = p_val
        user_updates["phoneNumber"] = p_val
        user_updates["phone_number"] = p_val

    if "dateOfBirth" in data or "date_of_birth" in data:
        dob_val = data.get("dateOfBirth") or data.get("date_of_birth")
        user_updates["date_of_birth"] = dob_val
        user_updates["dateOfBirth"] = dob_val

    if "gender" in data:
        user_updates["gender"] = data["gender"]

    if "instagram" in data:
        user_updates["instagram"] = data["instagram"]
    if "social_links" in data or "socialLinks" in data:
        s_val = data.get("social_links") or data.get("socialLinks")
        user_updates["social_links"] = s_val

    if publish is True or data.get("is_published") is True:
        user_updates["is_published"] = True
        user_updates["review_status"] = "approved"
        user_updates["status"] = "active"
    elif publish is False:
        user_updates["is_published"] = False
    elif "is_published" in data:
        user_updates["is_published"] = bool(data["is_published"])

    user_col.update_one(user_query, {"$set": user_updates})

    # Update talent_profiles collection
    profile_updates = {
        "user_id": target_uid,
        "full_name": full_name,
        "headline": headline,
        "bio": bio,
        "location": location,
        "city": city,
        "country": country,
        "category": category,
        "categories": categories,
        "avatar": avatar,
        "skills": skills,
        "languages": languages,
        "years_of_experience": years_exp,
        "experience_years": f"{years_exp}+" if years_exp else "0+",
        "availability_status": avail,
        "portfolio": merged_port,
        "updated_at": now_iso,
    }

    if "height" in data:
        profile_updates["height"] = data["height"]
    if "date_of_birth" in user_updates:
        profile_updates["date_of_birth"] = user_updates["date_of_birth"]
    if "gender" in user_updates:
        profile_updates["gender"] = user_updates["gender"]
    if "privacy_settings" in data or "privacySettings" in data:
        profile_updates["privacy_settings"] = data.get("privacy_settings") or data.get("privacySettings")
    if "preferred_project_types" in data or "preferredProjectTypes" in data:
        profile_updates["preferred_project_types"] = data.get("preferred_project_types") or data.get("preferredProjectTypes")
    if "experience" in data:
        profile_updates["experience"] = data["experience"]
    if "education" in data:
        profile_updates["education"] = data["education"]
    if "instagram" in data:
        profile_updates["instagram"] = data["instagram"]
    if "social_links" in data or "socialLinks" in data:
        profile_updates["social_links"] = data.get("social_links") or data.get("socialLinks")

    if "is_published" in user_updates:
        profile_updates["is_published"] = user_updates["is_published"]
        profile_updates["review_status"] = user_updates.get("review_status", "approved" if user_updates["is_published"] else "draft")

    prof_col.update_one({"user_id": target_uid}, {"$set": profile_updates}, upsert=True)

    return get_merged_candidate(target_uid)

def list_talent(is_published_only: bool = False, search: str = None, category: str = None, location: str = None):
    """
    List candidate/talent profiles from MongoDB Atlas, with talent_profiles merged.
    Filters out draft/unpublished/suspended profiles if is_published_only is True.
    """
    user_col = get_users_col()
    candidates = list(user_col.find({"role": {"$in": ["candidate", "talent"]}}).sort("created_at", -1))
    
    results = []
    for cand_raw in candidates:
        merged = get_merged_candidate(cand_raw.get("id"))
        if not merged:
            continue

        # Check suspension
        if merged.get("status") == "suspended":
            continue

        # Check publication status
        if is_published_only:
            is_pub = merged.get("is_published")
            if not is_pub:
                continue

        # Category filter
        if category and category != "All Categories":
            cat_target = category.lower().rstrip("s")
            c_cat = (merged.get("category") or "").lower()
            c_cats = [c.lower() for c in merged.get("categories") or []]
            if cat_target not in c_cat and not any(cat_target in c for c in c_cats):
                continue

        # Location filter
        if location and location != "All Locations":
            loc_target = location.lower()
            c_loc = (merged.get("location") or "").lower()
            c_city = (merged.get("city") or "").lower()
            c_country = (merged.get("country") or "").lower()
            if loc_target not in c_loc and loc_target not in c_city and loc_target not in c_country:
                continue

        # Text search (name, skills, headline, bio)
        if search and search.strip():
            q = search.lower().strip()
            name_m = q in (merged.get("full_name") or "").lower() or q in (merged.get("fullName") or "").lower()
            head_m = q in (merged.get("headline") or "").lower()
            bio_m = q in (merged.get("bio") or "").lower()
            skill_m = any(q in s.lower() for s in (merged.get("skills") or []))
            cat_m = any(q in c.lower() for c in (merged.get("categories") or [])) or q in (merged.get("category") or "").lower()
            if not (name_m or head_m or bio_m or skill_m or cat_m):
                continue

        results.append(merged)

    return results

def list_users(role: str = None, is_published_only: bool = False):
    if role in ('candidate', 'talent'):
        return list_talent(is_published_only=is_published_only)

    col = get_users_col()
    query = {}
    if role:
        query["role"] = role
    cursor = col.find(query).sort("created_at", -1)
    return [clean_doc(doc, drop_password=True) for doc in cursor]

def create_user(user_dict: dict):
    col = get_users_col()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if 'created_at' not in user_dict:
        user_dict['created_at'] = now_iso
    user_dict['updated_at'] = now_iso
    
    # Ensure default publication status is False for newly registered candidates
    if user_dict.get('role') in ('candidate', 'talent'):
        user_dict['is_published'] = False
        user_dict['review_status'] = 'draft'

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
                "fullName": user_dict.get('fullName', user_dict.get('full_name', '')),
                "phone_number": user_dict.get('phone_number', ''),
                "phoneNumber": user_dict.get('phoneNumber', user_dict.get('phone_number', '')),
                "category": user_dict.get('category', 'Actor'),
                "headline": user_dict.get('headline', 'Professional Talent'),
                "location": user_dict.get('location', 'Remote / Worldwide'),
                "skills": user_dict.get('skills', []),
                "languages": user_dict.get('languages', ['English']),
                "years_of_experience": user_dict.get('years_of_experience', 0),
                "availability_status": user_dict.get('availability_status', 'Available'),
                "portfolio": user_dict.get('portfolio', {}),
                "is_published": False,
                "review_status": "draft",
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

