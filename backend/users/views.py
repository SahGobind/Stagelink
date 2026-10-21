"""
StageLink Users & Authentication Views
======================================
Database-backed authentication and user profile management using MongoDB Atlas.
Uses PBKDF2 SHA-256 password hashing.
"""

import uuid
import datetime
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


class UserListView(APIView):
    """List all registered users / talent & recruiter directory from MongoDB."""
    def get(self, request):
        role = request.query_params.get("role")
        try:
            users = repository.list_users(role=role)
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

            user_doc = {
                "id": user_id,
                "email": email,
                "full_name": data["full_name"],
                "fullName": data["full_name"],
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
        
        email = serializer.validated_data["email"].lower().strip()
        raw_password = serializer.validated_data["password"]
        
        try:
            user = repository.find_user_by_email(email)
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
        user_id = request.query_params.get("id", "cand-aanya")
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
                profile = repository.get_talent_profile(user["id"])
                if profile:
                    for k, v in profile.items():
                        if k not in user or not user[k]:
                            user[k] = v

            return Response(clean_doc(user, drop_password=True), status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def put(self, request):
        user_id = request.query_params.get("id") or request.data.get("id")
        if not user_id:
            return Response({"error": "User ID is required to update profile."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = repository.find_user_by_id(user_id)
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = UserProfileSerializer(data=request.data, partial=True)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            updates = serializer.validated_data
            # Prevent altering role or id
            updates.pop("id", None)
            updates.pop("role", None)

            updated_user = repository.update_user(user["id"], updates)

            # Also update talent_profiles if applicable
            if user.get("role") in ("candidate", "talent"):
                profile_fields = {
                    k: v for k, v in updates.items()
                    if k in ("headline", "skills", "languages", "years_of_experience", "availability_status", "location")
                }
                if profile_fields:
                    repository.update_talent_profile(user["id"], profile_fields)

            return Response({
                "message": "Profile updated successfully",
                "user": updated_user
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
        email = data["email"].lower().strip()
        
        try:
            existing = repository.find_user_by_email(email)
            if existing:
                return Response({"error": "A recruiter account with this email already exists."}, status=status.HTTP_409_CONFLICT)
            
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
                "country": data["country"],
                "website": data.get("website", ""),
                "phone_number": data.get("phoneNumber", ""),
                "phoneNumber": data.get("phoneNumber", ""),
                "role": "recruiter",
                "password_hash": password_hash,
                "headline": f"Casting Director at {data['companyName']}",
                "location": data["country"],
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
        user_id = request.query_params.get("id", "rec-marcus")
        try:
            user = repository.find_user_by_id(user_id)
            if not user:
                return Response({"error": "Recruiter not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(clean_doc(user, drop_password=True), status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def put(self, request):
        user_id = request.query_params.get("id", "rec-marcus")
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
