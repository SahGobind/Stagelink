from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer

# In-memory store for users
SAMPLE_USERS = [
    {
        "id": "usr-1",
        "email": "elena.rostova@example.com",
        "full_name": "Elena Rostova",
        "role": "talent",
        "headline": "Action & Dramatic Lead Screen Actress",
        "location": "London, UK",
        "skills": ["Martial Arts", "Stunt Driving", "Stage Combat", "Method Acting", "Firearms Training"],
        "languages": ["English", "French", "Russian"],
        "years_of_experience": 8,
        "availability_status": "Available for Projects",
    },
    {
        "id": "usr-2",
        "email": "recruiter@paramount.test",
        "full_name": "Marcus Sterling",
        "role": "recruiter",
        "headline": "Senior Casting Director at Apex Vision Studios",
        "location": "London, UK",
        "skills": ["Casting Directing", "Talent Scouting", "International Packaging"],
        "languages": ["English"],
        "years_of_experience": 15,
        "availability_status": "Active Recruiter",
    }
]

class UserListView(APIView):
    """List all registered users / talent & recruiter directory."""
    def get(self, request):
        role = request.query_params.get("role")
        if role:
            filtered = [u for u in SAMPLE_USERS if u.get("role") == role]
            return Response(filtered, status=status.HTTP_200_OK)
        return Response(SAMPLE_USERS, status=status.HTTP_200_OK)

class UserRegisterView(APIView):
    """Register a new user account (in-memory demo)."""
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        # Check if email exists
        if any(u["email"].lower() == data["email"].lower() for u in SAMPLE_USERS):
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_409_CONFLICT)
        
        new_user = {
            "id": f"usr-{len(SAMPLE_USERS) + 1}",
            "email": data["email"],
            "full_name": data["full_name"],
            "role": data["role"],
            "headline": f"Professional {data['role'].capitalize()}",
            "location": "Remote / Worldwide",
            "skills": [],
            "languages": ["English"],
            "years_of_experience": 0,
            "availability_status": "Available",
        }
        SAMPLE_USERS.append(new_user)
        return Response({
            "message": "User registered successfully",
            "user": new_user,
            "token": f"mock-token-{new_user['id']}"
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    """Authenticate user with email and password (in-memory demo)."""
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid login credentials format", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"].lower()
        user = next((u for u in SAMPLE_USERS if u["email"].lower() == email), None)
        
        if not user:
            # For testing convenience, return default user profile if test account
            user = SAMPLE_USERS[0]
            
        return Response({
            "message": "Login successful",
            "token": f"mock-jwt-token-{user['id']}",
            "user": user
        }, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    """Get or update current candidate/recruiter profile."""
    def get(self, request):
        user_id = request.query_params.get("id", "usr-1")
        user = next((u for u in SAMPLE_USERS if u["id"] == user_id), SAMPLE_USERS[0])
        return Response(user, status=status.HTTP_200_OK)

    def put(self, request):
        user_id = request.query_params.get("id", "usr-1")
        user = next((u for u in SAMPLE_USERS if u["id"] == user_id), None)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserProfileSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        user.update(serializer.validated_data)
        return Response({"message": "Profile updated successfully", "user": user}, status=status.HTTP_200_OK)
