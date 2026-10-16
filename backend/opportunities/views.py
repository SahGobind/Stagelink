from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CastingOpportunitySerializer

# In-memory casting opportunities
SAMPLE_OPPORTUNITIES = [
    {
        "id": "opp-1",
        "title": "Echoes of the Crown",
        "production_company": "Apex Vision Studios",
        "category": "Feature Film",
        "type": "Union / SAG-AFTRA",
        "location": "London, UK & Budapest",
        "travel_covered": True,
        "description": "High-budget international espionage thriller following undercover intelligence agents across Europe.",
        "shooting_dates": "Nov 15, 2026 – Feb 20, 2027",
        "application_deadline": "2026-10-30",
        "status": "active",
        "applicant_count": 5,
        "shortlisted_count": 2,
        "roles": [
            {
                "id": "role-1",
                "title": "Major Anya Petrova (Lead Agent)",
                "category": "Lead Actor",
                "gender": "Female",
                "age_range": "28-38",
                "description": "Bilingual operational strategist specializing in close-quarters extraction.",
                "required_skills": ["Martial Arts", "Stunt Driving", "Stage Combat", "Method Acting", "Firearms Training"],
                "required_languages": ["English", "Russian"],
                "min_experience_years": 4,
                "rate": "SAG-AFTRA Theatrical Scale + 20%"
            },
            {
                "id": "role-2",
                "title": "Viktor Cross (Counter-Intelligence Lead)",
                "category": "Supporting Actor",
                "gender": "Male",
                "age_range": "35-50",
                "description": "Pragmatic bureau chief with subtle tactical gravitas.",
                "required_skills": ["Dramatic Delivery", "Dialect Mastery", "Method Acting"],
                "required_languages": ["English", "German"],
                "min_experience_years": 5,
                "rate": "SAG-AFTRA Scale"
            }
        ]
    },
    {
        "id": "opp-2",
        "title": "Neon Odyssey: 2088",
        "production_company": "Silverline Theatrical Pictures",
        "category": "Sci-Fi Series",
        "type": "High-End Streaming Series",
        "location": "Vancouver, Canada",
        "travel_covered": True,
        "description": "Futuristic episodic narrative exploring cybernetic autonomy and corporate detective thrillers.",
        "shooting_dates": "Jan 10, 2027 – May 30, 2027",
        "application_deadline": "2026-11-15",
        "status": "active",
        "applicant_count": 3,
        "shortlisted_count": 1,
        "roles": [
            {
                "id": "role-3",
                "title": "Kaelen Voss (Synth Detective)",
                "category": "Lead Actor",
                "gender": "Any",
                "age_range": "25-40",
                "description": "Hard-boiled cybernetic investigator balancing moral decay with high-tech grit.",
                "required_skills": ["Stage Combat", "Motion Capture", "Voice Modulation", "Green Screen"],
                "required_languages": ["English"],
                "min_experience_years": 3,
                "rate": "$4,500 / Episode Week"
            }
        ]
    }
]

class OpportunityListView(APIView):
    """List all casting opportunities with query filters or create new."""
    def get(self, request):
        category = request.query_params.get("category")
        location = request.query_params.get("location")
        search = request.query_params.get("search", "").lower()

        results = SAMPLE_OPPORTUNITIES
        if category and category != 'all':
            results = [o for o in results if o["category"].lower() == category.lower()]
        if location and location != 'all':
            results = [o for o in results if location.lower() in o["location"].lower()]
        if search:
            results = [
                o for o in results
                if search in o["title"].lower() or search in o["production_company"].lower()
            ]

        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CastingOpportunitySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        new_opp = {
            "id": f"opp-{len(SAMPLE_OPPORTUNITIES) + 1}",
            **serializer.validated_data,
            "applicant_count": 0,
            "shortlisted_count": 0
        }
        SAMPLE_OPPORTUNITIES.append(new_opp)
        return Response(new_opp, status=status.HTTP_201_CREATED)

class OpportunityDetailView(APIView):
    """Retrieve details for a single casting opportunity."""
    def get(self, request, pk):
        opp = next((o for o in SAMPLE_OPPORTUNITIES if o["id"] == pk), None)
        if not opp:
            return Response({"error": "Casting opportunity not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(opp, status=status.HTTP_200_OK)

class RecruiterOpportunitiesView(APIView):
    """List opportunities managed by current production recruiter."""
    def get(self, request):
        return Response({
            "recruiter": "Marcus Sterling (Apex Vision Studios)",
            "count": len(SAMPLE_OPPORTUNITIES),
            "opportunities": SAMPLE_OPPORTUNITIES
        }, status=status.HTTP_200_OK)
