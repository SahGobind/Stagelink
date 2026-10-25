"""
Automated Tests for StageLink Users, Authentication & MongoDB Lifecycle
=======================================================================
Tests MongoDB connection management, URI credential masking, password hashing,
authentication flows, role authorization, and error handling.
"""

from django.test import SimpleTestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from django.contrib.auth.hashers import check_password

from starcast.db import mask_mongodb_uri, mongo_manager, DatabaseUnavailableError
from starcast.test_utils import MockCollection
from starcast.seeder import INITIAL_USERS, INITIAL_TALENT_PROFILES


class MongoDBLifecycleAndAuthTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        self.mock_users = MockCollection("users", initial_docs=INITIAL_USERS)
        self.mock_profiles = MockCollection("talent_profiles", initial_docs=INITIAL_TALENT_PROFILES)
        
        self.patch_users = patch('users.repository.get_users_col', return_value=self.mock_users)
        self.patch_profiles = patch('users.repository.get_profiles_col', return_value=self.mock_profiles)
        self.patch_users.start()
        self.patch_profiles.start()

    def tearDown(self):
        self.patch_users.stop()
        self.patch_profiles.stop()

    def test_uri_credential_masking(self):
        """Verifies that MongoDB URIs never expose real credentials in logs/diagnostics."""
        raw_uri = "mongodb+srv://admin_user:SuperSecretP@ss!@cluster0.xudonxw.mongodb.net/?appName=StageLink"
        masked = mask_mongodb_uri(raw_uri)
        self.assertNotIn("SuperSecretP@ss!", masked)
        self.assertNotIn("admin_user", masked)
        self.assertIn("***:***", masked)

    def test_placeholder_credential_detection(self):
        """Verifies that template URIs with angle brackets are detected as unconfigured."""
        from unittest.mock import PropertyMock
        with patch.object(type(mongo_manager), 'uri', new_callable=PropertyMock, return_value='mongodb+srv://<URL_ENCODED_USERNAME>:<URL_ENCODED_PASSWORD>@cluster0.xudonxw.mongodb.net/'):
            self.assertFalse(mongo_manager.is_configured())


    def test_health_check_endpoint(self):
        """Verifies /api/health/ endpoint returns structured status without leaking credentials."""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("service", response.data)
        self.assertIn("database_connected", response.data)
        self.assertIn("database_engine", response.data)
        # Ensure no passwords leaked
        raw_text = str(response.data)
        self.assertNotIn("password", raw_text.lower())
        self.assertNotIn("secret", raw_text.lower())

    def test_user_registration_with_password_hashing(self):
        """Verifies registration hashes passwords using PBKDF2 SHA-256 and creates a talent profile."""
        payload = {
            "full_name": "Maya Lin",
            "email": "maya.lin@example.com",
            "password": "SecurePassword2026!",
            "role": "candidate"
        }
        response = self.client.post('/api/users/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["email"], "maya.lin@example.com")
        self.assertNotIn("password", response.data["user"])
        self.assertNotIn("password_hash", response.data["user"])
        self.assertTrue(response.data["token"].startswith("stg-token-"))

        # Verify password hash in database
        saved_user = self.mock_users.find_one({"email": "maya.lin@example.com"})
        self.assertIsNotNone(saved_user)
        self.assertTrue(check_password("SecurePassword2026!", saved_user["password_hash"]))

        # Verify talent profile record created in database
        saved_profile = self.mock_profiles.find_one({"user_id": saved_user["id"]})
        self.assertIsNotNone(saved_profile)
        self.assertEqual(saved_profile["full_name"], "Maya Lin")

    def test_duplicate_registration_rejected(self):
        """Verifies that duplicate registration by email returns 409 Conflict."""
        payload = {
            "full_name": "Duplicate Aanya",
            "email": "aanya@stagelink.com",
            "password": "Password123!",
            "role": "candidate"
        }
        response = self.client.post('/api/users/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["code"], "EMAIL_ALREADY_EXISTS")

    def test_prevent_privilege_escalation(self):
        """Verifies public registration cannot assign admin or operations privileges."""
        payload = {
            "full_name": "Attacker",
            "email": "attacker@example.com",
            "password": "Password123!",
            "role": "admin"
        }
        response = self.client.post('/api/users/register/', payload, format='json')
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN])

    def test_user_login_success_and_failure(self):
        """Verifies login authentication against hashed password."""
        # Valid login
        login_res = self.client.post('/api/users/login/', {
            "email": "aanya@stagelink.com",
            "password": "StageLink2026!"
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertEqual(login_res.data["user"]["email"], "aanya@stagelink.com")
        self.assertNotIn("password_hash", login_res.data["user"])

        # Invalid password
        bad_login = self.client.post('/api/users/login/', {
            "email": "aanya@stagelink.com",
            "password": "WrongPassword!"
        }, format='json')
        self.assertEqual(bad_login.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_profile_get_and_update(self):
        """Verifies retrieving and updating talent profile in MongoDB."""
        get_res = self.client.get('/api/users/profile/?id=cand-aanya')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["email"], "aanya@stagelink.com")

        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-aanya-test1234')
        update_res = self.client.put('/api/users/profile/?id=cand-aanya', {
            "headline": "Lead Screen Actress & Action Specialist",
            "location": "London & Mumbai",
            "skills": ["Martial Arts", "Method Acting", "Stunt Driving"]
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data["user"]["headline"], "Lead Screen Actress & Action Specialist")

    def test_database_unavailable_safe_error_response(self):
        """Verifies that when MongoDB is unavailable, a safe 503 response is returned without tracebacks."""
        with patch('users.repository.list_users', side_effect=DatabaseUnavailableError("Cluster unreachable")):
            response = self.client.get('/api/users/')
            self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
            self.assertEqual(response.data["code"], "DATABASE_UNAVAILABLE")
            self.assertIn("error", response.data)
            # Ensure no stack trace in response
            self.assertNotIn("Traceback", str(response.data))
