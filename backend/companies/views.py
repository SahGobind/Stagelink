"""
Companies Views — MongoDB Atlas Integration
============================================
Verified production companies and studio profiles persisted to MongoDB Atlas.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
import datetime
from .serializers import ProductionCompanySerializer, CompanyReviewSerializer
from starcast.db import get_collection
from starcast.utils import handle_db_error, clean_doc

class CompanyListView(APIView):
    """List verified production companies or create a new studio profile in MongoDB."""
    def get(self, request):
        try:
            col = get_collection('companies')
            cursor = col.find().sort("name", 1)
            results = [clean_doc(doc) for doc in cursor]
            return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        serializer = ProductionCompanySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            col = get_collection('companies')
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            new_comp = {
                "id": f"comp-{int(datetime.datetime.now().timestamp() * 1000)}",
                **serializer.validated_data,
                "created_at": now_iso
            }
            col.insert_one(new_comp)
            return Response(clean_doc(new_comp), status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)

class CompanyDetailView(APIView):
    """Retrieve or update details for a single production company in MongoDB."""
    def get(self, request, pk):
        try:
            col = get_collection('companies')
            query = {"$or": [{"id": pk}]}
            if ObjectId.is_valid(pk):
                query["$or"].append({"_id": ObjectId(pk)})
            company = col.find_one(query)
            if not company:
                return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(clean_doc(company), status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def put(self, request, pk):
        try:
            col = get_collection('companies')
            query = {"$or": [{"id": pk}]}
            if ObjectId.is_valid(pk):
                query["$or"].append({"_id": ObjectId(pk)})
            company = col.find_one(query)
            if not company:
                return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)
            
            data = request.data.copy()
            data.pop("id", None)
            data["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            col.update_one(query, {"$set": data})
            updated = col.find_one(query)
            return Response({
                "message": "Company profile updated successfully",
                "company": clean_doc(updated)
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def patch(self, request, pk):
        return self.put(request, pk)

class CompanyReviewView(APIView):
    """Candidate reviews and ratings for Production Companies."""
    def get(self, request, pk):
        try:
            col = get_collection('company_reviews')
            # Look up by company ID or case-insensitive company name
            query = {"$or": [{"company_id": pk}, {"company_name": pk}]}
            cursor = col.find(query).sort("created_at", -1)
            reviews = [clean_doc(doc) for doc in cursor]

            avg_rating = round(sum(r.get("rating", 5) for r in reviews) / len(reviews), 1) if reviews else 5.0
            return Response({
                "company_id": pk,
                "average_rating": avg_rating,
                "total_reviews": len(reviews),
                "reviews": reviews
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request, pk):
        serializer = CompanyReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            col = get_collection('company_reviews')
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            review_id = f"rev-comp-{int(datetime.datetime.now().timestamp() * 1000)}"

            new_review = {
                "id": review_id,
                "company_id": pk,
                "company_name": request.data.get("company_name", pk),
                "candidate_id": data["candidate_id"],
                "candidate_name": data["candidate_name"],
                "candidate_avatar": data.get("candidate_avatar", ""),
                "rating": float(data["rating"]),
                "feedback": data["feedback"],
                "opportunity_id": data.get("opportunity_id", ""),
                "opportunity_title": data.get("opportunity_title", ""),
                "categories": data.get("categories", {
                    "casting_experience": data["rating"],
                    "communication": data["rating"],
                    "professionalism": data["rating"]
                }),
                "created_at": now_iso
            }

            col.insert_one(new_review)

            # Re-aggregate company rating
            cursor = col.find({"$or": [{"company_id": pk}, {"company_name": pk}]})
            all_reviews = list(cursor)
            avg = round(sum(r.get("rating", 5) for r in all_reviews) / len(all_reviews), 1) if all_reviews else data["rating"]

            # Update companies collection if exists
            comp_col = get_collection('companies')
            comp_col.update_one(
                {"$or": [{"id": pk}, {"name": pk}]},
                {"$set": {"average_rating": avg, "total_reviews": len(all_reviews), "updated_at": now_iso}}
            )

            return Response({
                "message": "Production company review submitted successfully",
                "review": clean_doc(new_review),
                "company_stats": {
                    "average_rating": avg,
                    "total_reviews": len(all_reviews)
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)

