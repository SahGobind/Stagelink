"""
StageLink Database & API Serialization Utilities
=================================================
Provides helpers for MongoDB document sanitization, ObjectId handling,
UTC timestamp formatting, and safe error responses.
"""

import datetime
from bson import ObjectId
from rest_framework.response import Response
from rest_framework import status
from starcast.db import DatabaseUnavailableError, DatabaseOperationError
from pymongo.errors import PyMongoError
import logging

logger = logging.getLogger(__name__)

def clean_doc(doc, drop_password=True):
    """
    Recursively converts MongoDB types (ObjectId, datetime) to JSON-serializable primitives.
    Optionally strips sensitive fields like password_hash.
    """
    if doc is None:
        return None
    if isinstance(doc, list):
        return [clean_doc(item, drop_password=drop_password) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for k, v in doc.items():
            if k == '_id':
                # Convert ObjectId to string or keep id if already present
                if 'id' not in doc:
                    result['id'] = str(v)
                continue
            if drop_password and k in ('password_hash', 'password', 'token_secret'):
                continue
            if isinstance(v, ObjectId):
                result[k] = str(v)
            elif isinstance(v, (datetime.datetime, datetime.date)):
                result[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                result[k] = clean_doc(v, drop_password=drop_password)
            else:
                result[k] = v
        return result
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, (datetime.datetime, datetime.date)):
        return doc.isoformat()
    return doc


def handle_db_error(err: Exception) -> Response:
    """
    Standardizes error responses when database connectivity or queries fail.
    Never exposes internal tracebacks, connection strings, or credentials.
    """
    if isinstance(err, DatabaseUnavailableError):
        logger.warning("Database unavailable: %s", err)
        return Response({
            "error": "The database service is currently unavailable. Please verify cluster configuration or try again shortly.",
            "code": "DATABASE_UNAVAILABLE",
            "details": str(err)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    if isinstance(err, PyMongoError):
        logger.error("MongoDB operation error: %s", err)
        return Response({
            "error": "A database operation error occurred. Please try again.",
            "code": "DATABASE_ERROR"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    logger.exception("Unexpected error during database operation: %s", err)
    return Response({
        "error": "An unexpected server error occurred.",
        "code": "INTERNAL_ERROR"
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
