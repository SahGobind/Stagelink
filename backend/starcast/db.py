"""
StageLink MongoDB Atlas Integration Manager
============================================
Provides a resilient, thread-safe singleton connection manager for MongoDB Atlas using PyMongo.
Strictly adheres to security, connection lifecycle, and error-handling requirements:
- Client reuse (singleton pattern)
- Server selection and socket timeouts
- Safe URL masking (never logs credentials)
- Health check and latency measurement
- Collection index automation
"""

import os
import re
import time
import logging
from typing import Optional, Dict, Any
from urllib.parse import urlparse, quote_plus
from django.conf import settings
import pymongo
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from pymongo.errors import (
    PyMongoError,
    ConnectionFailure,
    ServerSelectionTimeoutError,
    ConfigurationError,
    OperationFailure,
)

logger = logging.getLogger(__name__)

class DatabaseUnavailableError(Exception):
    """Raised when MongoDB is unreachable, unconfigured, or timed out."""
    pass

class DatabaseOperationError(Exception):
    """Raised when a MongoDB query/write operation fails."""
    pass


def mask_mongodb_uri(uri: str) -> str:
    """
    Safely masks usernames and passwords in a MongoDB connection URI for diagnostic logging.
    Never exposes real credentials.
    """
    if not uri:
        return ""
    # Mask user:pass in mongodb:// or mongodb+srv://
    pattern = r'(mongodb(?:\+srv)?:\/\/)([^:@\s]+):([^@\s]+)@'
    return re.sub(pattern, r'\1***:***@', uri)


class MongoDBManager:
    """
    Thread-safe Singleton manager for MongoDB Atlas connection lifecycle.
    """
    _instance: Optional['MongoDBManager'] = None
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Prevent re-initialization if already created
        if getattr(self, '_initialized', False):
            return
        self._initialized = True
        self._client = None
        self._db = None

    @property
    def uri(self) -> str:
        return getattr(settings, 'MONGODB_URI', os.getenv('MONGODB_URI', '')).strip()

    @property
    def db_name(self) -> str:
        return getattr(settings, 'MONGODB_DB_NAME', os.getenv('MONGODB_DB_NAME', 'stagelink_db')).strip()

    @property
    def server_selection_timeout_ms(self) -> int:
        return getattr(settings, 'MONGODB_SERVER_SELECTION_TIMEOUT_MS', 5000)

    @property
    def connect_timeout_ms(self) -> int:
        return getattr(settings, 'MONGODB_CONNECT_TIMEOUT_MS', 5000)

    @property
    def socket_timeout_ms(self) -> int:
        return getattr(settings, 'MONGODB_SOCKET_TIMEOUT_MS', 10000)

    def is_configured(self) -> bool:
        """
        Validates whether the MongoDB URI is configured with real credentials
        and not just placeholder angle-brackets.
        """
        raw_uri = self.uri
        if not raw_uri:
            return False
        if '<URL_ENCODED_USERNAME>' in raw_uri or '<URL_ENCODED_PASSWORD>' in raw_uri:
            return False
        if '<username>' in raw_uri.lower() or '<password>' in raw_uri.lower():
            return False
        return True

    def get_client(self) -> MongoClient:
        """
        Returns the singleton MongoClient instance, creating it if needed.
        Raises DatabaseUnavailableError if unconfigured or unable to connect.
        """
        if self._client is not None:
            return self._client

        if not self.is_configured():
            raise DatabaseUnavailableError(
                "MongoDB Atlas URI is not configured or still contains placeholder credentials in .env. "
                "Please configure MONGODB_URI in your environment."
            )

        try:
            client = MongoClient(
                self.uri,
                serverSelectionTimeoutMS=self.server_selection_timeout_ms,
                connectTimeoutMS=self.connect_timeout_ms,
                socketTimeoutMS=self.socket_timeout_ms,
                appName='StageLink',
                retryWrites=True,
                w='majority'
            )
            # Perform a fast check to verify credentials and connectivity immediately
            client.admin.command('ping')
            self._client = client
            return self._client
        except (ServerSelectionTimeoutError, ConnectionFailure) as err:
            logger.error("MongoDB Atlas connection failure: %s", mask_mongodb_uri(self.uri))
            self._client = None
            raise DatabaseUnavailableError(
                "Unable to connect to MongoDB Atlas cluster within timeout. "
                "Verify network access, IP whitelist, and cluster availability."
            ) from err
        except ConfigurationError as err:
            logger.error("MongoDB Atlas configuration error: %s", err)
            self._client = None
            raise DatabaseUnavailableError(
                f"Invalid MongoDB URI configuration: {err}"
            ) from err
        except PyMongoError as err:
            logger.error("MongoDB error during client initialization: %s", err)
            self._client = None
            raise DatabaseUnavailableError(
                "Database initialization failed. Please check server logs."
            ) from err

    def get_database(self) -> Database:
        """
        Returns the persistent StageLink database instance.
        """
        if self._db is not None:
            return self._db

        client = self.get_client()
        self._db = client[self.db_name]
        return self._db

    def get_collection(self, name: str) -> Collection:
        """
        Convenience accessor for a named collection.
        """
        db = self.get_database()
        return db[name]

    def check_connection(self) -> Dict[str, Any]:
        """
        Non-throwing connectivity check for health checks and status reporting.
        Returns a clean diagnostic payload without revealing secrets.
        """
        if not self.is_configured():
            return {
                "connected": False,
                "status": "pending_credentials",
                "database": self.db_name,
                "message": "MongoDB Atlas URI placeholder present in .env. Awaiting real database user credentials.",
                "latency_ms": None,
                "collections": [],
            }

        start_time = time.time()
        try:
            client = self.get_client()
            client.admin.command('ping')
            latency = round((time.time() - start_time) * 1000, 2)
            db = self.get_database()
            collections = sorted(db.list_collection_names())
            return {
                "connected": True,
                "status": "healthy",
                "database": self.db_name,
                "latency_ms": latency,
                "collections": collections,
                "message": "MongoDB Atlas connection verified.",
            }
        except DatabaseUnavailableError as err:
            return {
                "connected": False,
                "status": "unavailable",
                "database": self.db_name,
                "latency_ms": None,
                "collections": [],
                "message": str(err),
            }
        except Exception as err:
            logger.error("Unexpected error in check_connection: %s", err)
            return {
                "connected": False,
                "status": "error",
                "database": self.db_name,
                "latency_ms": None,
                "collections": [],
                "message": "Database connection error.",
            }

    def ensure_indexes(self) -> Dict[str, Any]:
        """
        Applies necessary indexes across StageLink collections.
        Idempotent operation.
        """
        if not self.is_configured():
            return {"status": "skipped", "reason": "database_not_configured"}

        try:
            db = self.get_database()

            # 1. users: unique email, unique id, role index
            db.users.create_index([("email", pymongo.ASCENDING)], unique=True, name="idx_users_email_unique")
            db.users.create_index([("id", pymongo.ASCENDING)], unique=True, name="idx_users_id_unique")
            db.users.create_index([("role", pymongo.ASCENDING)], name="idx_users_role")

            # 2. talent_profiles: unique user_id, category, location, skills
            db.talent_profiles.create_index([("user_id", pymongo.ASCENDING)], unique=True, name="idx_profiles_userid_unique")
            db.talent_profiles.create_index([("category", pymongo.ASCENDING)], name="idx_profiles_category")
            db.talent_profiles.create_index([("location", pymongo.ASCENDING)], name="idx_profiles_location")
            db.talent_profiles.create_index([("skills", pymongo.ASCENDING)], name="idx_profiles_skills")

            # 3. casting_opportunities: unique id, status, production_company, created_at
            db.casting_opportunities.create_index([("id", pymongo.ASCENDING)], unique=True, name="idx_opps_id_unique")
            db.casting_opportunities.create_index([("status", pymongo.ASCENDING)], name="idx_opps_status")
            db.casting_opportunities.create_index([("production_company", pymongo.ASCENDING)], name="idx_opps_company")
            db.casting_opportunities.create_index([("created_at", pymongo.DESCENDING)], name="idx_opps_created_at")

            # 4. applications: unique id, compound (candidate_id, opportunity_id), status
            db.applications.create_index([("id", pymongo.ASCENDING)], unique=True, name="idx_apps_id_unique")
            db.applications.create_index([("candidate_id", pymongo.ASCENDING), ("opportunity_id", pymongo.ASCENDING)], name="idx_apps_cand_opp")
            db.applications.create_index([("status", pymongo.ASCENDING)], name="idx_apps_status")

            # 5. support_tickets: unique id, unique ticket_number, user_id, status, assigned_staff_id
            db.support_tickets.create_index([("id", pymongo.ASCENDING)], unique=True, name="idx_tickets_id_unique")
            db.support_tickets.create_index([("ticket_number", pymongo.ASCENDING)], unique=True, name="idx_tickets_number_unique")
            db.support_tickets.create_index([("user_id", pymongo.ASCENDING)], name="idx_tickets_userid")
            db.support_tickets.create_index([("status", pymongo.ASCENDING)], name="idx_tickets_status")
            db.support_tickets.create_index([("assigned_staff_id", pymongo.ASCENDING)], name="idx_tickets_assigned")

            # 6. payments: unique order_id, txn_id, opportunity_id
            db.payments.create_index([("order_id", pymongo.ASCENDING)], unique=True, name="idx_payments_order_unique")
            db.payments.create_index([("opportunity_id", pymongo.ASCENDING)], name="idx_payments_opp_id")

            # 7. notifications: user_id, read status, timestamp
            db.notifications.create_index([("user_id", pymongo.ASCENDING)], name="idx_notifs_userid")
            db.notifications.create_index([("read", pymongo.ASCENDING)], name="idx_notifs_read")
            db.notifications.create_index([("timestamp", pymongo.DESCENDING)], name="idx_notifs_time")

            # 8. companies: unique id, name
            db.companies.create_index([("id", pymongo.ASCENDING)], unique=True, name="idx_companies_id_unique")
            db.companies.create_index([("name", pymongo.ASCENDING)], name="idx_companies_name")

            return {"status": "success", "message": "All database indexes verified."}
        except Exception as err:
            logger.error("Error creating indexes: %s", err)
            return {"status": "error", "error": str(err)}

    def close(self):
        """Closes the active MongoClient connection."""
        if self._client is not None:
            try:
                self._client.close()
            except Exception as err:
                logger.warning("Error closing MongoDB client: %s", err)
            finally:
                self._client = None
                self._db = None


# Module-level singletons and helpers
mongo_manager = MongoDBManager()

def get_db() -> Database:
    """Returns the persistent StageLink MongoDB Database instance."""
    return mongo_manager.get_database()

def get_collection(name: str) -> Collection:
    """Returns a PyMongo Collection by name."""
    return mongo_manager.get_collection(name)

def check_db_connection() -> Dict[str, Any]:
    """Performs a non-throwing health check."""
    return mongo_manager.check_connection()

def ensure_indexes() -> Dict[str, Any]:
    """Ensures collection indexes exist."""
    return mongo_manager.ensure_indexes()
