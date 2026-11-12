"""
StageLink Users & Authentication Views
======================================
Database-backed authentication and user profile management using MongoDB Atlas.
Uses PBKDF2 SHA-256 password hashing.
"""

import uuid
import datetime
import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    RecruiterRegistrationSerializer,
)
from . import repository
from starcast.utils import handle_db_error, clean_doc, get_auth_user_from_request
from starcast.crypto import generate_signed_session_token as generate_session_token
from starcast.rbac import (
    Permissions,
    ALL_PERMISSIONS,
    DEFAULT_ROLE_PERMISSIONS,
    ROLE_HIERARCHY,
    get_role_permissions,
    get_user_permissions,
    user_has_permission,
    can_assign_role,
    get_roles_col,
)
from starcast.permissions import check_permission, check_resource_ownership
from starcast.audit import log_audit_event, query_audit_logs
import logging

logger = logging.getLogger(__name__)


class UserListView(APIView):
    """List all registered users / talent & recruiter directory from MongoDB."""
    def get(self, request):
        role = request.query_params.get("role")
        published_only = request.query_params.get("published_only", "").lower() in ("true", "1")
        search = request.query_params.get("search")
        category = request.query_params.get("category")
        location = request.query_params.get("location")
        try:
            if role in ("candidate", "talent"):
                users = repository.list_talent(
                    is_published_only=published_only,
                    search=search,
                    category=category,
                    location=location
                )
            else:
                users = repository.list_users(role=role, is_published_only=published_only)
            return Response(users, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)



class UserRegisterView(APIView):
    """Register a new user account backed by MongoDB Atlas."""
    def post(self, request):
        requested_role = (request.data.get("role") or "").strip().lower()
        if requested_role in ("admin", "operations", "super_admin"):
            log_audit_event(
                action="PRIVILEGE_ESCALATION_BLOCKED",
                resource_type="registration",
                status="DENIED",
                reason=f"Attempted public registration with privileged role '{requested_role}'",
                details={"email": request.data.get("email"), "attempted_role": requested_role},
                request=request
            )
            return Response(
                {"error": "Administrative roles cannot be assigned through public registration.", "code": "FORBIDDEN_ROLE"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        email = data["email"].lower().strip()
        
        try:
            # 1. Prevent duplicate registrations
            existing = repository.find_user_by_email(email)
            if existing:
                return Response(
                    {"error": "A user with this email address already exists.", "code": "EMAIL_ALREADY_EXISTS"},
                    status=status.HTTP_409_CONFLICT
                )
            
            role = data.get("role", "candidate")

            # 3. Hash password securely
            password_hash = make_password(data["password"])
            user_id = f"usr-{uuid.uuid4().hex[:8]}"

            phone = data.get("phone_number") or data.get("phoneNumber") or ""
            user_doc = {
                "id": user_id,
                "email": email,
                "full_name": data["full_name"],
                "fullName": data["full_name"],
                "phone_number": phone,
                "phoneNumber": phone,
                "role": role,
                "role_title": "Candidate" if role in ("candidate", "talent") else role.capitalize(),
                "password_hash": password_hash,
                "headline": "Candidate",
                "location": "Remote / Worldwide",
                "skills": [],
                "languages": ["English"],
                "years_of_experience": 0,
                "availability_status": "Available",
                "status": "active",
                "is_verified": False,
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }

            created_user = repository.create_user(user_doc)
            token = generate_session_token(user_id, role)

            return Response({
                "message": "User registered successfully",
                "user": created_user,
                "token": token
            }, status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)


class UserLoginView(APIView):
    """Authenticate user with email and password from MongoDB Atlas."""
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid login credentials format", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        login_input = serializer.validated_data["email"].lower().strip()
        raw_password = serializer.validated_data["password"]
        
        try:
            user = repository.find_user_by_email_or_phone(login_input)
            if not user:
                return Response(
                    {"error": "Invalid email or password.", "code": "INVALID_CREDENTIALS"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Verify password hash
            stored_hash = user.get("password_hash")
            if not stored_hash or not check_password(raw_password, stored_hash):
                return Response(
                    {"error": "Invalid email or password.", "code": "INVALID_CREDENTIALS"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            token = generate_session_token(user["id"], user.get("role", "candidate"))
            clean_user = clean_doc(user, drop_password=True)

            return Response({
                "message": "Login successful",
                "token": token,
                "user": clean_user
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserProfileView(APIView):
    """Get or update current candidate/recruiter profile in MongoDB."""
    def get(self, request):
        auth_user = get_auth_user_from_request(request)
        user_id = request.query_params.get("id") or (auth_user["id"] if auth_user else None) or "cand-aanya"
        if user_id == "me" and auth_user:
            user_id = auth_user.get("id") or str(auth_user.get("_id"))
        email = request.query_params.get("email")

        try:
            user = None
            if email:
                user = repository.find_user_by_email(email)
            if not user and user_id:
                user = repository.find_user_by_id(user_id)
            
            if not user:
                return Response({"error": "User profile not found.", "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

            # If candidate or talent, merge profile details if present
            if user.get("role") in ("candidate", "talent"):
                merged = repository.get_merged_candidate(user["id"])
                return Response(clean_doc(merged or user, drop_password=True), status=status.HTTP_200_OK)

            return Response(clean_doc(user, drop_password=True), status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def put(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user:
            return Response({
                "error": "Authentication required to update profile.",
                "code": "AUTHENTICATION_REQUIRED"
            }, status=status.HTTP_401_UNAUTHORIZED)

        user_id = request.query_params.get("id") or request.data.get("id") or (auth_user["id"] if auth_user else None)
        if not user_id:
            return Response({"error": "User ID is required to update profile."}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce security: Candidates cannot edit another candidate's profile
        if auth_user and auth_user.get("role") not in ("admin", "operations", "super_admin"):
            auth_ids = {str(auth_user.get("id")), str(auth_user.get("_id", ""))}
            if user_id not in ("me", auth_user.get("id")) and str(user_id) not in auth_ids:
                log_audit_event(
                    action="IDOR_ATTEMPT_BLOCKED",
                    actor=auth_user,
                    resource_type="profile",
                    resource_id=user_id,
                    status="DENIED",
                    reason="Unauthorized attempt to edit another user's profile",
                    request=request
                )
                return Response({"error": "You are not authorized to edit another user's profile.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        if user_id == "me" and auth_user:
            user_id = auth_user.get("id") or str(auth_user.get("_id"))

        try:
            user = repository.find_user_by_id(user_id)
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            if user.get("role") in ("candidate", "talent"):
                # Candidate profile update - strictly sanitize payload
                clean_payload = dict(request.data)
                clean_payload.pop("role", None)
                clean_payload.pop("custom_permissions", None)
                clean_payload.pop("permissions", None)
                clean_payload.pop("password_hash", None)
                updated_user = repository.update_candidate_full_profile(user["id"], clean_payload)
                log_audit_event(
                    action="PROFILE_UPDATED",
                    actor=auth_user,
                    resource_type="profile",
                    resource_id=user["id"],
                    status="SUCCESS",
                    request=request
                )
                return Response({
                    "message": "Profile updated successfully",
                    "user": updated_user
                }, status=status.HTTP_200_OK)
            else:
                serializer = UserProfileSerializer(data=request.data, partial=True)
                if not serializer.is_valid():
                    return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

                updates = serializer.validated_data
                updates.pop("id", None)
                updates.pop("role", None)
                updates.pop("custom_permissions", None)
                updates.pop("permissions", None)

                updated_user = repository.update_user(user["id"], updates)
                log_audit_event(
                    action="PROFILE_UPDATED",
                    actor=auth_user,
                    resource_type="profile",
                    resource_id=user["id"],
                    status="SUCCESS",
                    request=request
                )
                return Response({
                    "message": "Profile updated successfully",
                    "user": updated_user
                }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserProfilePublishView(APIView):
    """
    Validates candidate required fields and publishes the profile to MongoDB Atlas.
    Once published, the profile becomes available in Discover Talent and for casting call matching.
    """
    def post(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user:
            return Response({
                "error": "Authentication required to publish profile.",
                "code": "AUTHENTICATION_REQUIRED"
            }, status=status.HTTP_401_UNAUTHORIZED)

        user_id = request.query_params.get("id") or request.data.get("id") or auth_user.get("id")
        if not user_id:
            return Response({"error": "User ID is required to publish profile.", "code": "USER_ID_REQUIRED"}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce security: Candidates cannot publish another candidate's profile
        if auth_user.get("role") not in ("admin", "operations", "super_admin"):
            auth_ids = {str(auth_user.get("id")), str(auth_user.get("_id", ""))}
            if user_id not in ("me", auth_user.get("id")) and str(user_id) not in auth_ids:
                return Response({"error": "You are not authorized to publish another user's profile.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        if user_id == "me":
            user_id = auth_user.get("id") or str(auth_user.get("_id"))

        try:
            user = repository.find_user_by_id(user_id)
            if not user:
                return Response({"error": "Candidate not found.", "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

            existing = repository.get_merged_candidate(user["id"]) or user
            payload = request.data if isinstance(request.data, dict) else {}
            combined = {**existing, **payload}

            # Validate required fields for StageLink profile publication
            is_valid, missing_keys, missing_labels = repository.validate_profile_completion(combined)
            if not is_valid:
                return Response({
                    "error": f"Profile cannot be published until all required fields are completed: {', '.join(missing_labels)}.",
                    "code": "MISSING_REQUIRED_FIELDS",
                    "missing_fields": missing_keys,
                    "missing_labels": missing_labels
                }, status=status.HTTP_400_BAD_REQUEST)

            # Persist and publish in MongoDB Atlas
            published = repository.update_candidate_full_profile(user["id"], combined, publish=True)
            return Response({
                "message": "Candidate profile published successfully! Your talent card is now live on Discover Talent.",
                "user": published,
                "is_published": True
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserProfileUnpublishView(APIView):
    """Unpublish candidate profile so it is hidden from public Discover Talent."""
    def post(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user:
            return Response({
                "error": "Authentication required to unpublish profile.",
                "code": "AUTHENTICATION_REQUIRED"
            }, status=status.HTTP_401_UNAUTHORIZED)

        user_id = request.query_params.get("id") or request.data.get("id") or auth_user.get("id")
        if not user_id:
            return Response({"error": "User ID is required.", "code": "USER_ID_REQUIRED"}, status=status.HTTP_400_BAD_REQUEST)

        if user_id == "me":
            user_id = auth_user.get("id") or str(auth_user.get("_id"))

        if auth_user.get("role") not in ("admin", "operations", "super_admin"):
            auth_ids = {str(auth_user.get("id")), str(auth_user.get("_id", ""))}
            if user_id not in ("me", auth_user.get("id")) and str(user_id) not in auth_ids:
                return Response({"error": "Not authorized to unpublish another candidate's profile.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            updated = repository.update_candidate_full_profile(user_id, {}, publish=False)
            return Response({
                "message": "Candidate profile unpublished.",
                "user": updated,
                "is_published": False
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)



class RecruiterRegisterView(APIView):
    """Recruiter registration endpoint backed by MongoDB Atlas."""
    def post(self, request):
        serializer = RecruiterRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        raw_email = (data.get("email") or "").lower().strip()
        phone = (data.get("phoneNumber") or "").strip()
        
        try:
            if raw_email:
                existing = repository.find_user_by_email(raw_email)
                if existing:
                    return Response({"error": "A recruiter account with this email already exists."}, status=status.HTTP_409_CONFLICT)
                email = raw_email
            else:
                phone_digits = re.sub(r'[^0-9]', '', phone)
                base_ident = f"recruiter_{phone_digits}" if phone_digits else f"recruiter_{uuid.uuid4().hex[:8]}"
                email = f"{base_ident}@stagelink.local"
                if repository.find_user_by_email(email):
                    email = f"{base_ident}_{uuid.uuid4().hex[:4]}@stagelink.local"
            
            country_val = data.get("country") or "India"
            password_hash = make_password(data["password"])
            recruiter_id = f"rec-{uuid.uuid4().hex[:8]}"
            
            new_recruiter = {
                "id": recruiter_id,
                "email": email,
                "full_name": data["fullName"],
                "fullName": data["fullName"],
                "company_name": data["companyName"],
                "companyName": data["companyName"],
                "productionCompany": data["companyName"],
                "country": country_val,
                "website": data.get("website", ""),
                "phone_number": phone,
                "phoneNumber": phone,
                "role": "recruiter",
                "role_title": "Casting Director",
                "password_hash": password_hash,
                "headline": f"Casting Director at {data['companyName']}",
                "location": country_val,
                "verification_status": "verified",
                "is_verified": True,
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }
            
            created = repository.create_user(new_recruiter)
            token = generate_session_token(recruiter_id, "recruiter")

            return Response({
                "message": "Recruiter account created successfully.",
                "user": created,
                "token": token,
                "verification_pending": False
            }, status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)


class RecruiterLoginView(APIView):
    """Recruiter login endpoint backed by MongoDB Atlas."""
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid format", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"].lower().strip()
        raw_password = serializer.validated_data["password"]
        
        try:
            user = repository.find_user_by_email(email)
            if not user or user.get("role") not in ("recruiter", "admin", "production_company"):
                return Response({"error": "Invalid recruiter credentials.", "code": "INVALID_CREDENTIALS"}, status=status.HTTP_401_UNAUTHORIZED)
            
            stored_hash = user.get("password_hash")
            if not stored_hash or not check_password(raw_password, stored_hash):
                return Response({"error": "Invalid recruiter credentials.", "code": "INVALID_CREDENTIALS"}, status=status.HTTP_401_UNAUTHORIZED)

            token = generate_session_token(user["id"], user.get("role", "recruiter"))
            clean_recruiter = clean_doc(user, drop_password=True)

            return Response({
                "message": "Recruiter login successful",
                "token": token,
                "user": clean_recruiter
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class RecruiterProfileView(APIView):
    """Get or update recruiter company profile in MongoDB."""
    def get(self, request):
        auth_user = get_auth_user_from_request(request)
        user_id = request.query_params.get("id") or (auth_user["id"] if auth_user else None) or "rec-marcus"
        try:
            user = repository.find_user_by_id(user_id)
            if not user:
                return Response({"error": "Recruiter not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(clean_doc(user, drop_password=True), status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def put(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user:
            return Response({
                "error": "Authentication required to update company profile.",
                "code": "AUTHENTICATION_REQUIRED"
            }, status=status.HTTP_401_UNAUTHORIZED)

        user_id = request.query_params.get("id") or request.data.get("id") or auth_user.get("id")

        # Enforce security: Recruiters cannot edit another recruiter's company profile
        if auth_user.get("role") not in ("admin", "operations", "super_admin"):
            auth_ids = {str(auth_user.get("id")), str(auth_user.get("_id", ""))}
            if user_id not in ("me", auth_user.get("id")) and str(user_id) not in auth_ids:
                return Response({
                    "error": "You are not authorized to edit another recruiter's profile.",
                    "code": "FORBIDDEN"
                }, status=status.HTTP_403_FORBIDDEN)

        if user_id == "me":
            user_id = auth_user.get("id") or str(auth_user.get("_id"))

        try:
            user = repository.find_user_by_id(user_id)
            if not user:
                return Response({"error": "Recruiter not found"}, status=status.HTTP_404_NOT_FOUND)
            
            data = request.data
            updates = {}
            if "companyName" in data or "company_name" in data:
                val = data.get("companyName") or data.get("company_name")
                updates["companyName"] = val
                updates["company_name"] = val
                updates["productionCompany"] = val
            if "fullName" in data or "full_name" in data:
                val = data.get("fullName") or data.get("full_name")
                updates["fullName"] = val
                updates["full_name"] = val
            if "website" in data:
                updates["website"] = data["website"]
            if "country" in data:
                updates["country"] = data["country"]
                updates["location"] = data["country"]
            if "phoneNumber" in data or "phone_number" in data:
                val = data.get("phoneNumber") or data.get("phone_number")
                updates["phoneNumber"] = val
                updates["phone_number"] = val
            if "yearsOfExperience" in data or "years_of_experience" in data:
                val = data.get("yearsOfExperience") or data.get("years_of_experience")
                updates["yearsOfExperience"] = val
                updates["years_of_experience"] = val
            if "experienceBio" in data or "experience_bio" in data or "bio" in data:
                val = data.get("experienceBio") or data.get("experience_bio") or data.get("bio")
                updates["experienceBio"] = val
                updates["bio"] = val
            if "pastProductions" in data or "past_productions" in data or "experience" in data:
                val = data.get("pastProductions") or data.get("past_productions") or data.get("experience")
                updates["pastProductions"] = val
                updates["past_productions"] = val
                updates["experience"] = val
                
            updated = repository.update_user(user["id"], updates)
            return Response({
                "message": "Company profile updated successfully",
                "user": updated
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserPermissionsView(APIView):
    """
    Returns the authoritative role, granular permissions, and access levels
    for the currently authenticated session.
    """
    def get(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user:
            return Response({
                "authenticated": False,
                "role": "guest",
                "permissions": sorted(list(get_role_permissions("guest"))),
                "is_super_admin": False,
                "is_admin": False
            }, status=status.HTTP_200_OK)

        role = auth_user.get("role", "user")
        perms = get_user_permissions(auth_user)
        return Response({
            "authenticated": True,
            "user": clean_doc(auth_user, drop_password=True),
            "role": role,
            "permissions": sorted(list(perms)),
            "is_super_admin": role == "super_admin",
            "is_admin": role in ("admin", "super_admin"),
        }, status=status.HTTP_200_OK)


class RoleListView(APIView):
    """
    List all system roles, hierarchy levels, descriptions, and their configured permissions.
    Protected by role:view permission.
    """
    def get(self, request):
        perm_error = check_permission(request, Permissions.ROLE_VIEW, resource_type="roles")
        if perm_error:
            return perm_error

        roles_data = []
        role_metadata = {
            "super_admin": {"title": "Super Administrator", "description": "Full system authority, role configuration, and audit management."},
            "admin": {"title": "Platform Administrator", "description": "Operational oversight, user moderation, and application review."},
            "operations": {"title": "Operations Desk", "description": "Support ticket triage, verified listings review, and user assistance."},
            "recruiter": {"title": "Production Recruiter", "description": "Casting calls creation, audition candidate management, and applicant reviews."},
            "candidate": {"title": "Performer / Talent", "description": "Profile showcase, audition submissions, and application tracking."},
            "user": {"title": "Standard Platform User", "description": "Standard user access with least privilege baseline permissions."},
        }

        for role_name, meta in role_metadata.items():
            perms = get_role_permissions(role_name)
            roles_data.append({
                "role": role_name,
                "title": meta["title"],
                "description": meta["description"],
                "level": ROLE_HIERARCHY.get(role_name, 0),
                "permissions_count": len(perms),
                "permissions": sorted(list(perms)),
                "is_system_role": role_name in ("super_admin", "admin"),
            })

        return Response({
            "count": len(roles_data),
            "all_available_permissions": ALL_PERMISSIONS,
            "roles": roles_data
        }, status=status.HTTP_200_OK)


class RoleDetailView(APIView):
    """
    Retrieve or update permissions for a specific role.
    PUT is restricted strictly to Super Admin (role:manage permission).
    """
    def get(self, request, role_name):
        perm_error = check_permission(request, Permissions.ROLE_VIEW, resource_type="roles", resource_id=role_name)
        if perm_error:
            return perm_error

        perms = get_role_permissions(role_name)
        return Response({
            "role": role_name,
            "permissions": sorted(list(perms))
        }, status=status.HTTP_200_OK)

    def put(self, request, role_name):
        perm_error = check_permission(request, Permissions.ROLE_MANAGE, resource_type="roles", resource_id=role_name)
        if perm_error:
            return perm_error

        clean_role = role_name.strip().lower()
        if clean_role == "super_admin":
            return Response({
                "error": "The super_admin role permissions are fixed and cannot be modified.",
                "code": "IMMUTABLE_ROLE"
            }, status=status.HTTP_400_BAD_REQUEST)

        new_permissions = request.data.get("permissions")
        if not isinstance(new_permissions, list):
            return Response({
                "error": "Expected 'permissions' to be an array of permission strings.",
                "code": "INVALID_FORMAT"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate that all passed permissions exist in ALL_PERMISSIONS
        invalid = [p for p in new_permissions if p not in ALL_PERMISSIONS]
        if invalid:
            return Response({
                "error": f"Invalid permissions specified: {', '.join(invalid)}",
                "code": "UNKNOWN_PERMISSIONS"
            }, status=status.HTTP_400_BAD_REQUEST)

        col = get_roles_col()
        if col is not None:
            try:
                col.update_one(
                    {"name": clean_role},
                    {"$set": {
                        "name": clean_role,
                        "permissions": new_permissions,
                        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        "updated_by": request.auth_user.get("id")
                    }},
                    upsert=True
                )
            except Exception as e:
                logger.warning("Could not persist role update in MongoDB: %s", e)

        # Update in-memory fallback dictionary
        DEFAULT_ROLE_PERMISSIONS[clean_role] = new_permissions

        log_audit_event(
            action="ROLE_PERMISSION_UPDATED",
            actor=request.auth_user,
            resource_type="role",
            resource_id=clean_role,
            status="SUCCESS",
            details={"updated_permissions": new_permissions},
            request=request
        )

        return Response({
            "message": f"Permissions updated successfully for role '{clean_role}'.",
            "role": clean_role,
            "permissions": new_permissions
        }, status=status.HTTP_200_OK)


class UserRoleManageView(APIView):
    """
    Secure endpoint to assign or modify roles for users.
    Enforces strict privilege escalation barriers:
    - Only Super Admin can assign 'admin' or 'super_admin'.
    - Admin can only assign standard user roles ('candidate', 'recruiter', 'user').
    - Non-admin cannot assign roles.
    - Cannot modify own role.
    - Cannot demote the primary super_admin.
    """
    def post(self, request):
        perm_error = check_permission(request, Permissions.ROLE_ASSIGN, resource_type="user_roles")
        if perm_error:
            return perm_error

        actor = request.auth_user
        target_user_id = request.data.get("user_id")
        target_role = (request.data.get("role") or "").strip().lower()
        custom_permissions = request.data.get("custom_permissions", None)

        if not target_user_id or not target_role:
            return Response({
                "error": "Both 'user_id' and 'role' are required.",
                "code": "MISSING_FIELDS"
            }, status=status.HTTP_400_BAD_REQUEST)

        if target_role not in ROLE_HIERARCHY:
            return Response({
                "error": f"Invalid role '{target_role}'. Valid roles: {list(ROLE_HIERARCHY.keys())}",
                "code": "INVALID_ROLE"
            }, status=status.HTTP_400_BAD_REQUEST)

        # 1. Prevent self-role modification
        actor_id = actor.get("id") or str(actor.get("_id", ""))
        if target_user_id == actor_id:
            return Response({
                "error": "You cannot alter your own role or privileges.",
                "code": "SELF_MODIFICATION_FORBIDDEN"
            }, status=status.HTTP_403_FORBIDDEN)

        # 2. Prevent privilege escalation
        if not can_assign_role(actor, target_role):
            log_audit_event(
                action="PRIVILEGE_ESCALATION_BLOCKED",
                actor=actor,
                resource_type="user",
                resource_id=target_user_id,
                status="DENIED",
                reason=f"User {actor_id} ({actor.get('role')}) attempted to assign unauthorized role {target_role}",
                details={"attempted_role": target_role},
                request=request
            )
            return Response({
                "error": f"Your role ({actor.get('role')}) does not have permission to assign the '{target_role}' role.",
                "code": "PRIVILEGE_ESCALATION_FORBIDDEN"
            }, status=status.HTTP_403_FORBIDDEN)

        # 3. Find target user
        target_user = repository.find_user_by_id(target_user_id)
        if not target_user:
            return Response({
                "error": "Target user not found.",
                "code": "USER_NOT_FOUND"
            }, status=status.HTTP_404_NOT_FOUND)

        # 4. Protect the root superadmin from demotion
        if target_user.get("id") == "superadmin-1" and target_role != "super_admin":
            return Response({
                "error": "The primary Super Admin account cannot be demoted.",
                "code": "ROOT_ADMIN_IMMUTABLE"
            }, status=status.HTTP_403_FORBIDDEN)

        # 5. Apply update
        updates = {"role": target_role}
        if custom_permissions is not None:
            if not isinstance(custom_permissions, list):
                return Response({"error": "custom_permissions must be an array."}, status=status.HTTP_400_BAD_REQUEST)
            updates["custom_permissions"] = custom_permissions

        updated = repository.update_user(target_user["id"], updates)

        log_audit_event(
            action="ROLE_ASSIGNED",
            actor=actor,
            resource_type="user",
            resource_id=target_user_id,
            status="SUCCESS",
            details={
                "previous_role": target_user.get("role"),
                "new_role": target_role,
                "custom_permissions": custom_permissions
            },
            request=request
        )

        return Response({
            "message": f"Successfully updated role for user '{target_user.get('email')}' to '{target_role}'.",
            "user": clean_doc(updated, drop_password=True)
        }, status=status.HTTP_200_OK)


class AuditLogListView(APIView):
    """
    Search and inspect immutable security audit logs.
    Restricted to Super Admin and Admin (audit:view permission).
    """
    def get(self, request):
        perm_error = check_permission(request, Permissions.AUDIT_VIEW, resource_type="audit_logs")
        if perm_error:
            return perm_error

        actor_id = request.query_params.get("actor_id")
        action = request.query_params.get("action")
        resource_type = request.query_params.get("resource_type")
        status_param = request.query_params.get("status")
        try:
            limit = min(int(request.query_params.get("limit", 100)), 500)
            skip = int(request.query_params.get("skip", 0))
        except ValueError:
            limit = 100
            skip = 0

        logs = query_audit_logs(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            status=status_param,
            limit=limit,
            skip=skip
        )

        return Response({
            "count": len(logs),
            "limit": limit,
            "skip": skip,
            "results": logs
        }, status=status.HTTP_200_OK)


class UserPasswordChangeView(APIView):
    """
    Secure password change endpoint.
    Requires current password verification and enforces new password strength.
    """
    def post(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user:
            return Response({"error": "Authentication required to change password.", "code": "UNAUTHORIZED"}, status=status.HTTP_401_UNAUTHORIZED)
        
        current_password = request.data.get("current_password") or request.data.get("currentPassword")
        new_password = request.data.get("new_password") or request.data.get("newPassword")
        
        if not current_password or not new_password:
            return Response({"error": "Both current_password and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = repository.find_user_by_id(auth_user["id"])
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        stored_hash = user.get("password_hash")
        if stored_hash and not check_password(current_password, stored_hash):
            log_audit_event(
                action="PASSWORD_CHANGE_FAILED",
                actor=auth_user,
                resource_type="auth",
                resource_id=auth_user["id"],
                status="DENIED",
                reason="Incorrect current password",
                request=request
            )
            return Response({"error": "Current password is incorrect.", "code": "INVALID_PASSWORD"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Validate strength of new password
        from starcast.crypto import validate_password_strength
        is_strong, errors = validate_password_strength(new_password, user)
        if not is_strong:
            return Response({"error": "New password does not meet security requirements.", "details": errors}, status=status.HTTP_400_BAD_REQUEST)
            
        # Hash new password
        new_hash = make_password(new_password)
        repository.update_user(user["id"], {"password_hash": new_hash})
        
        log_audit_event(
            action="PASSWORD_CHANGED",
            actor=auth_user,
            resource_type="auth",
            resource_id=auth_user["id"],
            status="SUCCESS",
            request=request
        )
        
        return Response({"message": "Password changed successfully. Your account is secured."}, status=status.HTTP_200_OK)


class AdminDashboardOverviewView(APIView):
    """
    Authoritative aggregated analytics and overview metrics for StageLink Admin Suite.
    Directly queries live MongoDB Atlas collections.
    """
    def get(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin", "operations"):
            return Response({"error": "Admin access required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            from starcast.db import get_collection

            users_col = get_collection('users')
            opps_col = get_collection('casting_opportunities')
            apps_col = get_collection('applications')
            payments_col = get_collection('payments')
            audit_col = get_collection('audit_logs')

            # 1. Total Counts
            total_users = users_col.count_documents({}) if users_col is not None else 0
            total_artists = users_col.count_documents({"role": {"$in": ["candidate", "talent"]}}) if users_col is not None else 0
            total_companies = users_col.count_documents({"role": {"$in": ["recruiter", "production_company"]}}) if users_col is not None else 0
            
            # Active casting calls
            active_casting_calls = opps_col.count_documents({"status": {"$in": ["published", "open", "active"]}}) if opps_col is not None else 0
            
            # Total applications
            total_applications = apps_col.count_documents({}) if apps_col is not None else 0

            # Pending verifications: unverified users + pending moderation opportunities
            pending_users = users_col.count_documents({"$or": [{"is_verified": False}, {"status": "pending"}, {"review_status": "pending"}]}) if users_col is not None else 0
            pending_opps = opps_col.count_documents({"status": {"$in": ["pending", "pending_moderation", "review"]}}) if opps_col is not None else 0
            pending_verifications = pending_users + pending_opps

            # Total revenue calculated from payments collection
            total_revenue = 0
            recent_payments = []
            if payments_col is not None:
                pipeline = [
                    {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
                ]
                agg = list(payments_col.aggregate(pipeline))
                if agg:
                    total_revenue = agg[0].get("total", 0)
                
                pay_cursor = payments_col.find().sort("created_at", -1).limit(6)
                recent_payments = [clean_doc(p) for p in pay_cursor]

            # 2. Recent Registrations (latest 6 users)
            recent_users_cur = users_col.find({}, {"password_hash": 0}).sort("created_at", -1).limit(6) if users_col is not None else []
            recent_registrations = [clean_doc(u, drop_password=True) for u in recent_users_cur]

            # 3. Recent Platform Activity (latest 6 audit logs)
            recent_activity = []
            if audit_col is not None:
                audit_cur = audit_col.find().sort("timestamp", -1).limit(6)
                recent_activity = [clean_doc(a) for a in audit_cur]

            # 4. Casting Call Performance (grouped by category)
            category_performance = []
            if opps_col is not None:
                pipeline_cat = [
                    {"$group": {"_id": "$category", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                    {"$limit": 6}
                ]
                for item in opps_col.aggregate(pipeline_cat):
                    cat_name = item.get("_id") or "Feature Film"
                    category_performance.append({
                        "category": cat_name,
                        "count": item.get("count", 0)
                    })

            metrics_data = {
                "total_users": total_users,
                "total_artists": total_artists,
                "total_companies": total_companies,
                "active_casting_calls": active_casting_calls,
                "total_applications": total_applications,
                "pending_verifications": pending_verifications,
                "total_revenue": total_revenue,
                "currency": "INR",
            }

            return Response({
                "metrics": metrics_data,
                "kpis": metrics_data,
                "recent_registrations": recent_registrations,
                "recent_activity": recent_activity,
                "category_performance": category_performance,
                "recent_payments": recent_payments,
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserAdminToggleVerificationView(APIView):
    """Admin endpoint to approve/verify or unverify a user account."""
    def post(self, request, user_id):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin", "operations"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            target = repository.find_user_by_id(user_id)
            if not target:
                return Response({"error": "User not found.", "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

            current_status = target.get("is_verified", False)
            new_status = not current_status

            updated = repository.update_user(target["id"], {
                "is_verified": new_status,
                "status": "active" if new_status else "pending",
                "verification_status": "verified" if new_status else "unverified"
            })

            log_audit_event(
                action="USER_VERIFICATION_TOGGLED",
                actor=auth_user,
                resource_type="user",
                resource_id=target["id"],
                status="SUCCESS",
                details={"previous_verified": current_status, "new_verified": new_status},
                request=request
            )

            return Response({
                "message": f"User verification status updated to {new_status}.",
                "user": clean_doc(updated, drop_password=True),
                "is_verified": new_status
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserAdminDeleteView(APIView):
    """Admin endpoint to safely remove or deactivate a user."""
    def delete(self, request, user_id):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            target = repository.find_user_by_id(user_id)
            if not target:
                return Response({"error": "User not found.", "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

            if target.get("id") == "superadmin-1" or target.get("role") == "super_admin":
                return Response({"error": "Super Admin accounts cannot be deleted.", "code": "PROTECTED_ACCOUNT"}, status=status.HTTP_403_FORBIDDEN)

            col = repository.get_users_col()
            col.delete_one({"id": target["id"]})

            log_audit_event(
                action="USER_DELETED",
                actor=auth_user,
                resource_type="user",
                resource_id=target["id"],
                status="SUCCESS",
                details={"deleted_user_email": target.get("email"), "deleted_user_role": target.get("role")},
                request=request
            )

            return Response({"message": f"User '{target.get('email')}' deleted successfully."}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserAdminUpdateStatusView(APIView):
    """Admin endpoint to activate or suspend any user account."""
    def post(self, request, user_id):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin", "operations"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get("status")
        if new_status not in ("active", "suspended", "pending"):
            return Response({"error": "Invalid status. Must be 'active', 'suspended', or 'pending'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = repository.find_user_by_id(user_id)
            if not target:
                return Response({"error": "User not found.", "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

            if target.get("role") == "super_admin" and new_status == "suspended":
                return Response({"error": "Super Admin accounts cannot be suspended.", "code": "PROTECTED_ACCOUNT"}, status=status.HTTP_403_FORBIDDEN)

            updated = repository.update_user(target["id"], {
                "status": new_status,
                "is_active": (new_status == "active")
            })

            log_audit_event(
                action="USER_STATUS_UPDATED",
                actor=auth_user,
                resource_type="user",
                resource_id=target["id"],
                status="SUCCESS",
                details={"previous_status": target.get("status"), "new_status": new_status},
                request=request
            )

            return Response({
                "message": f"User account status updated to '{new_status}'.",
                "user": clean_doc(updated, drop_password=True)
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserAdminUpdateProfileView(APIView):
    """Super Admin endpoint to edit permitted user information."""
    def put(self, request, user_id):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            target = repository.find_user_by_id(user_id)
            if not target:
                return Response({"error": "User not found.", "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

            data = request.data
            updates = {}
            if "fullName" in data or "full_name" in data:
                val = data.get("fullName") or data.get("full_name")
                updates["fullName"] = val
                updates["full_name"] = val
            if "email" in data and data["email"].strip():
                updates["email"] = data["email"].strip().lower()
            if "role" in data and data["role"] in ("candidate", "recruiter", "admin", "operations"):
                updates["role"] = data["role"]
            if "category" in data:
                updates["category"] = data["category"]
            if "location" in data:
                updates["location"] = data["location"]
            if "phoneNumber" in data or "phone" in data:
                val = data.get("phoneNumber") or data.get("phone")
                updates["phoneNumber"] = val
                updates["phone_number"] = val
            if "headline" in data:
                updates["headline"] = data["headline"]
            if "bio" in data:
                updates["bio"] = data["bio"]
            if "is_verified" in data:
                updates["is_verified"] = bool(data["is_verified"])
            if "status" in data and data["status"] in ("active", "suspended", "pending"):
                updates["status"] = data["status"]
                updates["is_active"] = (data["status"] == "active")

            updated = repository.update_user(target["id"], updates)

            log_audit_event(
                action="USER_PROFILE_ADMIN_UPDATED",
                actor=auth_user,
                resource_type="user",
                resource_id=target["id"],
                status="SUCCESS",
                details={"updated_fields": list(updates.keys())},
                request=request
            )

            return Response({
                "message": f"Profile for '{target.get('email')}' updated successfully.",
                "user": clean_doc(updated, drop_password=True)
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class UserAdminCreateView(APIView):
    """Super Admin endpoint to directly provision and register a user account."""
    def post(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        role = data.get("role", "candidate")
        full_name = data.get("fullName") or data.get("full_name") or "New Member"

        if not email or not password:
            return Response({"error": "Email and password are required.", "code": "MISSING_CREDENTIALS"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            existing = repository.find_user_by_email(email)
            if existing:
                return Response({"error": "An account with this email already exists.", "code": "USER_EXISTS"}, status=status.HTTP_409_CONFLICT)

            is_valid, errs = validate_password_strength(password)
            if not is_valid:
                return Response({"error": "Password does not meet security requirements.", "details": errs}, status=status.HTTP_400_BAD_REQUEST)

            import uuid
            new_id = f"usr-{uuid.uuid4().hex[:12]}"
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            password_hash = make_password(password)

            user_doc = {
                "id": new_id,
                "email": email,
                "password_hash": password_hash,
                "fullName": full_name,
                "full_name": full_name,
                "role": role,
                "category": data.get("category", "Actor"),
                "location": data.get("location", "Mumbai, India"),
                "phoneNumber": data.get("phone", ""),
                "is_verified": data.get("is_verified", True),
                "status": "active",
                "is_active": True,
                "created_at": now_iso,
                "updated_at": now_iso,
            }

            users_col = repository.get_users_col()
            users_col.insert_one(user_doc)

            log_audit_event(
                action="USER_ADMIN_CREATED",
                actor=auth_user,
                resource_type="user",
                resource_id=new_id,
                status="SUCCESS",
                details={"created_email": email, "assigned_role": role},
                request=request
            )

            return Response({
                "message": f"User '{email}' provisioned successfully.",
                "user": clean_doc(user_doc, drop_password=True)
            }, status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)


class AdminPlatformSettingsView(APIView):
    """Super Admin endpoint to manage and retrieve platform-wide configuration settings."""
    def get(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            from starcast.db import get_collection
            settings_col = get_collection('platform_settings')
            doc = settings_col.find_one({"id": "global_config"}) if settings_col is not None else None

            default_settings = {
                "general": {
                    "platform_name": "StageLink",
                    "tagline": "International Talent & Casting Network",
                    "contact_email": "support@stagelink.com",
                    "contact_phone": "+91 98765 43210",
                    "default_currency": "INR",
                    "timezone": "Asia/Kolkata (IST)",
                },
                "branding": {
                    "accent_color": "#FA5A36",
                    "dark_navy": "#0B1120",
                    "logo_url": "/assets/stagelink-logo.png",
                    "favicon_url": "/favicon.ico",
                },
                "email": {
                    "smtp_host": "smtp.sendgrid.net",
                    "smtp_port": "587",
                    "sender_name": "StageLink Notifications",
                    "sender_email": "no-reply@stagelink.com",
                    "enable_tls": True,
                },
                "payments": {
                    "razorpay_enabled": True,
                    "stripe_enabled": True,
                    "escrow_enabled": True,
                    "environment": "live",
                    "currency": "INR",
                    "platform_fee_percent": 5.0,
                },
                "security": {
                    "mfa_enforced": False,
                    "session_timeout_minutes": 120,
                    "password_min_length": 8,
                    "rate_limiting_enabled": True,
                },
                "file_media": {
                    "max_video_size_mb": 100,
                    "max_image_size_mb": 10,
                    "supported_video_formats": "mp4, mov, webm",
                    "supported_image_formats": "jpg, png, webp",
                },
                "seo": {
                    "meta_title": "StageLink | Premier Casting & Talent Audition Suite",
                    "meta_description": "Connect verified actors, models, and voice artists with top production houses.",
                    "indexing_enabled": True,
                },
                "maintenance": {
                    "maintenance_mode": False,
                    "maintenance_message": "StageLink is undergoing scheduled platform enhancements. We will be back shortly.",
                }
            }

            if doc:
                merged = {**default_settings, **clean_doc(doc)}
                return Response(merged, status=status.HTTP_200_OK)
            return Response(default_settings, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            from starcast.db import get_collection
            settings_col = get_collection('platform_settings')
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

            new_settings = request.data
            new_settings["id"] = "global_config"
            new_settings["updated_at"] = now_iso
            new_settings["updated_by"] = auth_user.get("email")

            if settings_col is not None:
                settings_col.update_one({"id": "global_config"}, {"$set": new_settings}, upsert=True)

            log_audit_event(
                action="PLATFORM_SETTINGS_UPDATED",
                actor=auth_user,
                resource_type="settings",
                resource_id="global_config",
                status="SUCCESS",
                details={"updated_sections": list(new_settings.keys())},
                request=request
            )

            return Response({"message": "Platform configuration settings successfully updated and persisted to MongoDB Atlas."}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class AdminCMSView(APIView):
    """Super Admin endpoint to manage website banners, FAQs, and CMS announcements."""
    def get(self, request):
        try:
            from starcast.db import get_collection
            cms_col = get_collection('platform_cms')
            doc = cms_col.find_one({"id": "homepage_cms"}) if cms_col is not None else None

            defaults = {
                "banner": {
                    "enabled": True,
                    "text": "Auditions open for Feature Film: Lead & Supporting Characters (Mumbai & Delhi).",
                    "link": "/admin/casting-calls",
                    "badge": "Hot Notice",
                    "theme": "orange"
                },
                "faqs": [
                    {"q": "How does artist verification work on StageLink?", "a": "Our administrative team manually verifies government identification, previous film/theatre credits, and active representation agency references."},
                    {"q": "How are production studio casting payments protected?", "a": "All transactions are escrowed or settled through bank-grade encrypted payment gateways with instant reconciliation."},
                    {"q": "Can production houses review high-definition video reels?", "a": "Yes, talent profiles support embedded 4K showreels and direct video audition submissions."}
                ],
                "announcements": [
                    {"id": "ann-1", "title": "Platform Redesign 2.0 Live", "date": "Today", "author": "Super Admin"}
                ]
            }

            if doc:
                return Response({**defaults, **clean_doc(doc)}, status=status.HTTP_200_OK)
            return Response(defaults, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user or auth_user.get("role") not in ("admin", "super_admin"):
            return Response({"error": "Admin clearance required.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        try:
            from starcast.db import get_collection
            cms_col = get_collection('platform_cms')
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

            cms_data = request.data
            cms_data["id"] = "homepage_cms"
            cms_data["updated_at"] = now_iso
            cms_data["updated_by"] = auth_user.get("email")

            if cms_col is not None:
                cms_col.update_one({"id": "homepage_cms"}, {"$set": cms_data}, upsert=True)

            log_audit_event(
                action="CMS_CONTENT_UPDATED",
                actor=auth_user,
                resource_type="cms",
                resource_id="homepage_cms",
                status="SUCCESS",
                details={"updated_keys": list(cms_data.keys())},
                request=request
            )

            return Response({"message": "Website content and announcements persisted successfully."}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)




