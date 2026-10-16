from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import calculate_role_match_score, DEFAULT_WEIGHTS
from .serializers import BulkShortlistSerializer, CriteriaWeightUpdateSerializer

# Sample candidate talent pool for ranking demonstrations
SAMPLE_CANDIDATES = [
    {
        "id": "cand-1",
        "full_name": "Elena Rostova",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "headline": "Action & Dramatic Lead Screen Actress",
        "category": "Actor",
        "location": "London, UK",
        "skills": ["Martial Arts", "Stunt Driving", "Stage Combat", "Method Acting", "Firearms Training"],
        "languages": ["English", "Russian", "French"],
        "years_of_experience": 8,
        "availability_status": "Available for Projects",
        "portfolio": {
            "video_reel": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_audition_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "headshots": [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
            ],
            "resume_url": "https://example.com/resumes/elena_rostova.pdf"
        },
        "experience_credits": [
            {"title": "The Berlin Cipher", "role": "Agent Sonya", "year": 2024},
            {"title": "Shadow Protocol", "role": "Lt. Vance", "year": 2022}
        ]
    },
    {
        "id": "cand-2",
        "full_name": "Marcus Sterling Jr.",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        "headline": "Classical Shakespearian & Tactical Performer",
        "category": "Actor",
        "location": "Budapest, Hungary",
        "skills": ["Stage Combat", "Dialect Mastery", "Method Acting", "Fencing"],
        "languages": ["English", "German", "Hungarian"],
        "years_of_experience": 6,
        "availability_status": "Available for Projects",
        "portfolio": {
            "video_reel": "https://www.w3schools.com/html/mov_bbb.mp4",
            "headshots": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"],
            "resume_url": "https://example.com/resumes/marcus.pdf"
        },
        "experience_credits": [
            {"title": "Crown & Dagger", "role": "Captain Mercer", "year": 2023}
        ]
    },
    {
        "id": "cand-3",
        "full_name": "Maya Lin",
        "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        "headline": "Emerging Screen Talent & Stunt Extra",
        "category": "Actor",
        "location": "Edinburgh, UK",
        "skills": ["Stage Combat", "Horseback Riding"],
        "languages": ["English"],
        "years_of_experience": 2,
        "availability_status": "Notice Period: 2 Weeks",
        "portfolio": {
            "headshots": ["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"]
        },
        "experience_credits": []
    }
]

ROLE_REQUIREMENTS_OPP1 = {
    "title": "Major Anya Petrova (Lead Agent)",
    "required_skills": ["Martial Arts", "Stunt Driving", "Stage Combat", "Method Acting", "Firearms Training"],
    "required_languages": ["English", "Russian"],
    "min_experience_years": 4
}

OPPORTUNITY_CONTEXT_OPP1 = {
    "location": "London, UK & Budapest",
    "travel_covered": True
}

class RankedCandidatesView(APIView):
    """
    Get ranked candidate list for a specific casting opportunity.
    Returns calculated transparent match scores, breakdowns, evidence, and sorting.
    """
    def get(self, request, opp_id):
        sort_by = request.query_params.get("sort_by", "match_score") # match_score, experience, applied_date
        category = request.query_params.get("category")
        location = request.query_params.get("location")
        skill = request.query_params.get("skill")
        search = request.query_params.get("search", "").lower()

        ranked_list = []
        for cand in SAMPLE_CANDIDATES:
            score_data = calculate_role_match_score(
                candidate_profile=cand,
                role_requirements=ROLE_REQUIREMENTS_OPP1,
                opportunity_context=OPPORTUNITY_CONTEXT_OPP1
            )
            
            application_entry = {
                "id": f"app-{cand['id']}-{opp_id}",
                "candidate": cand,
                "opportunity_id": opp_id,
                "opportunity_title": "Echoes of the Crown",
                "role_applied_for": ROLE_REQUIREMENTS_OPP1["title"],
                "status": "shortlisted" if cand["id"] == "cand-1" else "under_review",
                "applied_date": "2026-10-12T14:30:00Z" if cand["id"] == "cand-1" else "2026-10-13T09:00:00Z",
                "match_score": score_data
            }
            ranked_list.append(application_entry)

        # Filters
        if category and category != 'all':
            ranked_list = [a for a in ranked_list if a["candidate"]["category"].lower() == category.lower()]
        if location and location != 'all':
            ranked_list = [a for a in ranked_list if location.lower() in a["candidate"]["location"].lower()]
        if skill and skill != 'all':
            ranked_list = [
                a for a in ranked_list
                if any(skill.lower() in s.lower() for s in a["candidate"]["skills"])
            ]
        if search:
            ranked_list = [
                a for a in ranked_list
                if search in a["candidate"]["full_name"].lower()
                or any(search in s.lower() for s in a["candidate"]["skills"])
            ]

        # Sorting
        if sort_by == 'match_score':
            ranked_list.sort(key=lambda x: x["match_score"]["total_score"], reverse=True)
        elif sort_by == 'experience':
            ranked_list.sort(key=lambda x: x["candidate"]["years_of_experience"], reverse=True)
        elif sort_by == 'applied_date':
            ranked_list.sort(key=lambda x: x["applied_date"], reverse=True)

        return Response({
            "opportunity_id": opp_id,
            "role_title": ROLE_REQUIREMENTS_OPP1["title"],
            "total_candidates": len(ranked_list),
            "shortlisted_count": sum(1 for a in ranked_list if a["status"] == "shortlisted"),
            "average_match_score": round(sum(a["match_score"]["total_score"] for a in ranked_list) / max(1, len(ranked_list)), 1),
            "results": ranked_list
        }, status=status.HTTP_200_OK)

class CandidateRecalculateScoreView(APIView):
    """Trigger transparent score recalculation for an application."""
    def post(self, request, app_id):
        # Find candidate or use default
        cand = SAMPLE_CANDIDATES[0]
        score_data = calculate_role_match_score(
            candidate_profile=cand,
            role_requirements=ROLE_REQUIREMENTS_OPP1,
            opportunity_context=OPPORTUNITY_CONTEXT_OPP1
        )
        return Response({
            "message": "Score recalculated successfully using current role criteria",
            "application_id": app_id,
            "match_score": score_data
        }, status=status.HTTP_200_OK)

class CandidateComparisonView(APIView):
    """Compare 2 to 4 candidates side-by-side across all 6 criteria."""
    def get(self, request):
        ids_param = request.query_params.get("ids", "cand-1,cand-2")
        selected_ids = [i.strip() for i in ids_param.split(",") if i.strip()]

        candidates_data = []
        for cid in selected_ids:
            cand = next((c for c in SAMPLE_CANDIDATES if c["id"] == cid), None)
            if cand:
                score = calculate_role_match_score(cand, ROLE_REQUIREMENTS_OPP1, OPPORTUNITY_CONTEXT_OPP1)
                candidates_data.append({
                    "candidate": cand,
                    "match_score": score
                })

        return Response({
            "compared_count": len(candidates_data),
            "role": ROLE_REQUIREMENTS_OPP1,
            "comparison": candidates_data
        }, status=status.HTTP_200_OK)

class BulkShortlistView(APIView):
    """Bulk shortlist multiple applicants with audit confirmation."""
    def post(self, request):
        serializer = BulkShortlistSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        app_ids = serializer.validated_data["application_ids"]
        notes = serializer.validated_data.get("notes", "")

        return Response({
            "message": f"Successfully shortlisted {len(app_ids)} candidate(s)",
            "shortlisted_ids": app_ids,
            "notes": notes,
            "audit_logged": True
        }, status=status.HTTP_200_OK)

class ScoringCriteriaView(APIView):
    """Get or update role scoring criteria weights."""
    def get(self, request):
        return Response({
            "weights": DEFAULT_WEIGHTS,
            "total_max_points": 100.0,
            "fairness_rules": {
                "protected_attributes_excluded": True,
                "popularity_bias_free": True,
                "explainability_breakdown_required": True
            }
        }, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = CriteriaWeightUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        updated = DEFAULT_WEIGHTS.copy()
        updated.update(serializer.validated_data)
        return Response({
            "message": "Scoring criteria weights updated for this casting call",
            "weights": updated
        }, status=status.HTTP_200_OK)
