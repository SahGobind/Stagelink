"""
Automated Tests for Audition Applications MongoDB Atlas Workflows
=================================================================
Tests audition application submission, duplicate prevention, candidate privacy protection,
status transitions, and application withdrawal in MongoDB Atlas.
"""

from django.test import SimpleTestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

from starcast.test_utils import MockCollection
from starcast.seeder import INITIAL_APPLICATIONS, INITIAL_USERS


class ApplicationsAPITests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        self.mock_apps = MockCollection("applications", initial_docs=INITIAL_APPLICATIONS)
        self.mock_users = MockCollection("users", initial_docs=INITIAL_USERS)
        self.patch_apps = patch('applications.repository.get_apps_col', return_value=self.mock_apps)
        self.patch_users = patch('users.repository.get_users_col', return_value=self.mock_users)
        self.patch_apps.start()
        self.patch_users.start()

    def tearDown(self):
        self.patch_apps.stop()
        self.patch_users.stop()

    def test_application_submission(self):
        """Verifies submitting a new application into MongoDB."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-rohit-test1234')
        payload = {
            "opportunity_id": "opp-2",
            "role_id": "role-3",
            "candidate_id": "cand-rohit",
            "candidate_name": "Rohit Verma",
            "cover_message": "Passionate performer with extensive classical diction.",
            "video_audition_url": "https://example.com/auditions/rohit.mp4"
        }
        response = self.client.post('/api/applications/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["application"]["candidate_id"], "cand-rohit")
        self.assertEqual(response.data["application"]["status"], "submitted")

    def test_duplicate_application_prevention(self):
        """Verifies candidate cannot submit multiple active applications to the same opportunity."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-1-test1234')
        # cand-1 already applied to opp-1 in initial data
        payload = {
            "opportunity_id": "opp-1",
            "role_id": "role-1",
            "candidate_id": "cand-1",
            "cover_message": "Trying to apply twice."
        }
        response = self.client.post('/api/applications/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "DUPLICATE_APPLICATION")

    def test_candidate_privacy_safe_my_applications(self):
        """Verifies that candidates viewing own applications never receive private recruiter notes."""
        response = self.client.get('/api/applications/my/?candidate_id=cand-1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data["applications"]) > 0)
        for app in response.data["applications"]:
            self.assertNotIn("internal_notes", app)
            self.assertNotIn("match_score_value", app)

    def test_status_update_and_withdrawal(self):
        """Verifies recruiter status update and candidate withdrawal."""
        # Admin / Recruiter shortlists app-102
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-admin-admin-1-test1234')
        update_res = self.client.patch('/api/applications/app-102/status/', {
            "status": "shortlisted",
            "note": "Great screen presence in reel."
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data["application"]["status"], "shortlisted")

        # Candidate withdraws
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-2-test1234')
        withdraw_res = self.client.post('/api/applications/app-102/withdraw/')
        self.assertEqual(withdraw_res.status_code, status.HTTP_200_OK)
        self.assertEqual(withdraw_res.data["application"]["status"], "withdrawn")
