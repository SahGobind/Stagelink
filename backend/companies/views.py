from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ProductionCompanySerializer

SAMPLE_COMPANIES = [
    {
        "id": "comp-1",
        "name": "Apex Vision Studios",
        "industry": "High-Concept Action Thrillers",
        "location": "London, UK & Budapest",
        "website": "https://apexvisionstudios.com",
        "description": "Award-winning international production company developing theatrical espionage sagas.",
        "verified": True,
        "active_projects_count": 3
    },
    {
        "id": "comp-2",
        "name": "Silverline Theatrical Pictures",
        "industry": "Independent Drama & Series",
        "location": "Los Angeles, CA, USA",
        "website": "https://silverlinepictures.com",
        "description": "Leading studio specializing in character-driven period dramas and award contenders.",
        "verified": True,
        "active_projects_count": 2
    }
]

class CompanyListView(APIView):
    """List verified production companies or create a new studio profile."""
    def get(self, request):
        return Response({"count": len(SAMPLE_COMPANIES), "results": SAMPLE_COMPANIES}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProductionCompanySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        new_comp = {
            "id": f"comp-{len(SAMPLE_COMPANIES) + 1}",
            **serializer.validated_data
        }
        SAMPLE_COMPANIES.append(new_comp)
        return Response(new_comp, status=status.HTTP_201_CREATED)

class CompanyDetailView(APIView):
    """Retrieve details for a single production company."""
    def get(self, request, pk):
        company = next((c for c in SAMPLE_COMPANIES if c["id"] == pk), None)
        if not company:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(company, status=status.HTTP_200_OK)
