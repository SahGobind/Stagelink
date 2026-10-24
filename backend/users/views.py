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
from starcast.utils import handle_db_error, clean_doc

def generate_session_token(user_id: str, role: str) -> str:
    """Generate a consistent session token string for API consumers."""
    return f"stg-token-{role}-{user_id}-{uuid.uuid4().hex[:12]}"


def get_auth_user_from_request(request):
    """
    Extracts authenticated user from Authorization header or session token.
    Token format: stg-token-{role}-{user_id}-{hash} or Bearer {token}
    """
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    else:
        token = auth_header.strip()

    if not token or not token.startswith("stg-token-"):
        return None

    try:
        body = token[len("stg-token-"):]
        role, rest = body.split("-", 1)
        user_id, _ = rest.rsplit("-", 1)
        if user_id:
            user = repository.find_user_by_id(user_id)
            if user:
                return user
    except Exception:
        pass
    return None


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
            
            # 2. Prevent privilege escalation
            role = data.get("role", "candidate")
            if role in ("admin", "operations"):
                return Response(
                    {"error": "Administrative roles cannot be assigned through public registration.", "code": "FORBIDDEN_ROLE"},
                    status=status.HTTP_403_FORBIDDEN
                )

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
                "password_hash": password_hash,
                "headline": f"Professional {role.capitalize()}",
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
            password_valid = False
            if stored_hash:
                password_valid = check_password(raw_password, stored_hash)
            elif raw_password:
                # If demo seed account had plaintext or empty hash in legacy test
                password_valid = True

            if not password_valid:
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
        user_id = request.query_params.get("id") or request.data.get("id") or (auth_user["id"] if auth_user else None)
        if not user_id:
            return Response({"error": "User ID is required to update profile."}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce security: Candidates cannot edit another candidate's profile
        if auth_user and auth_user.get("role") not in ("admin", "operations"):
            auth_ids = {str(auth_user.get("id")), str(auth_user.get("_id", ""))}
            if user_id not in ("me", auth_user.get("id")) and str(user_id) not in auth_ids:
                return Response({"error": "You are not authorized to edit another user's profile.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        if user_id == "me" and auth_user:
            user_id = auth_user.get("id") or str(auth_user.get("_id"))

        try:
            user = repository.find_user_by_id(user_id)
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            if user.get("role") in ("candidate", "talent"):
                # Candidate profile update
                updated_user = repository.update_candidate_full_profile(user["id"], request.data)
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

                updated_user = repository.update_user(user["id"], updates)

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
        user_id = request.query_params.get("id") or request.data.get("id") or (auth_user["id"] if auth_user else None)
        if not user_id:
            return Response({"error": "User ID is required to publish profile.", "code": "USER_ID_REQUIRED"}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce security: Candidates cannot publish another candidate's profile
        if auth_user and auth_user.get("role") not in ("admin", "operations"):
            auth_ids = {str(auth_user.get("id")), str(auth_user.get("_id", ""))}
            if user_id not in ("me", auth_user.get("id")) and str(user_id) not in auth_ids:
                return Response({"error": "You are not authorized to publish another user's profile.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

        if user_id == "me" and auth_user:
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
        user_id = request.query_params.get("id") or request.data.get("id") or (auth_user["id"] if auth_user else None)
        if not user_id:
            return Response({"error": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        if user_id == "me" and auth_user:
            user_id = auth_user.get("id") or str(auth_user.get("_id"))

        if auth_user and auth_user.get("role") not in ("admin", "operations"):
            auth_ids = {str(auth_user.get("id")), str(auth_user.get("_id", ""))}
            if user_id not in ("me", auth_user.get("id")) and str(user_id) not in auth_ids:
                return Response({"error": "Not authorized.", "code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

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
            valid = False
            if stored_hash:
                valid = check_password(raw_password, stored_hash)
            elif raw_password:
                valid = True

            if not valid:
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
        user_id = request.query_params.get("id") or request.data.get("id") or (auth_user["id"] if auth_user else None) or "rec-marcus"
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
                
            updated = repository.update_user(user["id"], updates)
            return Response({
                "message": "Company profile updated successfully",
                "user": updated
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)
