"""
Unit and integration tests for StageLink Help & Support System.
Tests ticket creation, user isolation, staff workflow, internal notes privacy, and role permissions.
"""
from django.test import SimpleTestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from starcast.test_utils import MockCollection
from starcast.seeder import INITIAL_SUPPORT_TICKETS

class SupportAPITests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        self.mock_col = MockCollection("support_tickets", initial_docs=INITIAL_SUPPORT_TICKETS)
        self.patcher = patch('support.repository.get_tickets_col', return_value=self.mock_col)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_health_check(self):
        response = self.client.get('/api/support/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("status"), "healthy")

    def test_candidate_create_ticket(self):
        payload = {
            "category": "Casting Applications",
            "subject": "Question about audition recording deadline",
            "message": "Can I submit my self-tape on Saturday morning instead of Friday evening?",
            "user_id": "cand-aanya",
            "user_name": "Aanya Sharma",
            "user_email": "aanya@stagelink.com",
            "user_role": "candidate"
        }
        response = self.client.post('/api/support/tickets/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["ticket_number"].startswith("STG-"))
        self.assertEqual(response.data["ticket"]["status"], "open")
        self.assertEqual(response.data["ticket"]["user_id"], "cand-aanya")
        # Internal notes must be empty for candidate
        self.assertEqual(response.data["ticket"]["notes"], [])

    def test_recruiter_create_ticket(self):
        payload = {
            "category": "Listing Fees & Payments",
            "subject": "Request for GST tax invoice copy",
            "message": "We paid $199 for job publishing and need the official invoice with company tax registration.",
            "user_id": "rec-marcus",
            "user_name": "Marcus Sterling",
            "user_email": "recruiter@stagelink.com",
            "user_role": "recruiter",
            "company_name": "Apex Vision Studios"
        }
        response = self.client.post('/api/support/tickets/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["ticket_number"].startswith("STG-"))
        self.assertEqual(response.data["ticket"]["company_name"], "Apex Vision Studios")

    def test_user_ticket_isolation(self):
        # Candidate Sophia should not be allowed to access Aanya's STG-1001 ticket directly
        response = self.client.get('/api/support/tickets/STG-1001/?role=candidate&user_id=cand-sophia')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # But Aanya can access STG-1001
        response = self.client.get('/api/support/tickets/STG-1001/?role=candidate&user_id=cand-aanya')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # And internal notes must be hidden from Aanya
        self.assertEqual(response.data.get("notes"), [])

    def test_operations_staff_full_access(self):
        # Staff can view STG-1001 and see internal notes
        response = self.client.get('/api/support/tickets/STG-1001/?role=operations')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data.get("notes", [])) > 0)

    def test_staff_internal_note_restricted_to_users(self):
        # Candidate cannot post internal note
        note_payload = {
            "note": "Candidate attempting to inject private note",
            "operator_role": "candidate"
        }
        response = self.client.post('/api/support/tickets/STG-1001/note/', note_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Staff can post internal note
        staff_note = {
            "note": "Spoke to casting coordinator; deadline extended by 24h.",
            "operator_role": "operations",
            "author_name": "Sarah Jenkins"
        }
        response = self.client.post('/api/support/tickets/STG-1001/note/', staff_note, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_reply_workflow(self):
        # Staff replies to ticket
        staff_reply = {
            "content": "Hi Aanya, we confirmed with the director that Saturday 10 AM is acceptable.",
            "sender_name": "Sarah Jenkins",
            "sender_role": "operations"
        }
        response = self.client.post('/api/support/tickets/STG-1001/reply/', staff_reply, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["ticket"]["unread_for_user"])

        # Candidate replies back
        candidate_reply = {
            "content": "Thank you so much Sarah! I will upload by Saturday 9 AM.",
            "sender_name": "Aanya Sharma",
            "sender_role": "candidate",
            "sender_id": "cand-aanya"
        }
        response = self.client.post('/api/support/tickets/STG-1001/reply/', candidate_reply, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["ticket"]["unread_for_staff"])

    def test_status_update_and_metrics(self):
        # Operation staff marks ticket resolved
        update_payload = {
            "status": "resolved",
            "operator_role": "operations",
            "operator_name": "Sarah Jenkins"
        }
        response = self.client.patch('/api/support/tickets/STG-1001/', update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ticket"]["status"], "resolved")

        # Check metrics endpoint
        metrics_res = self.client.get('/api/support/metrics/?role=operations')
        self.assertEqual(metrics_res.status_code, status.HTTP_200_OK)
        self.assertIn("resolved_tickets", metrics_res.data)
        self.assertIn("total_tickets", metrics_res.data)
