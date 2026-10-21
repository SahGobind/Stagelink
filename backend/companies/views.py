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
from .serializers import ProductionCompanySerializer
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
