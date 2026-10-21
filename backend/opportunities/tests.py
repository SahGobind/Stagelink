"""
Automated Tests for Casting Opportunities & Payments MongoDB Atlas Workflows
=============================================================================
Tests casting call creation, publishing, authoritative pricing, server-side validation,
idempotent payment order lifecycle, and moderation in MongoDB Atlas.
"""

from django.test import SimpleTestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

from starcast.test_utils import MockCollection
from starcast.seeder import INITIAL_OPPORTUNITIES


class CastingOpportunitiesAPITests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        self.mock_opps = MockCollection("casting_opportunities", initial_docs=INITIAL_OPPORTUNITIES)
        self.mock_payments = MockCollection("payments", initial_docs=[])

        self.patch_opps = patch('opportunities.repository.get_opps_col', return_value=self.mock_opps)
        self.patch_payments = patch('opportunities.views.get_collection', side_effect=lambda name: self.mock_payments if name == 'payments' else self.mock_opps)
        self.patch_opps.start()
        self.patch_payments.start()


    def tearDown(self):
        self.patch_opps.stop()
        self.patch_payments.stop()

    def test_public_opportunities_list(self):
        """Verifies public casting calls list returns published opportunities and excludes drafts."""
        response = self.client.get('/api/opportunities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        for opp in response.data["results"]:
            self.assertIn(opp.get("status"), ["published", "open", "active"])
            self.assertNotEqual(opp.get("status"), "draft")

    def test_opportunity_validation(self):
        """Verifies server-side casting opportunity field validation."""
        # Missing required fields
        bad_res = self.client.post('/api/opportunities/validate/', {}, format='json')
        self.assertEqual(bad_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(bad_res.data["valid"])

        # Valid payload
        valid_payload = {
            "productionCompany": "Apex Vision Studios",
            "title": "Echoes of Eternity",
            "productionCategory": "Film & TV",
            "productionType": "Feature Film",
            "talentNeeded": ["Actors"],
            "location": "London, UK",
            "artistsNeeded": 3,
            "shootDate": "2026-12-01",
            "applicationDeadline": "2026-11-20"
        }
        good_res = self.client.post('/api/opportunities/validate/', valid_payload, format='json')
        self.assertEqual(good_res.status_code, status.HTTP_200_OK)
        self.assertTrue(good_res.data["valid"])

    def test_pricing_calculation(self):
        """Verifies authoritative pricing calculation with tax and discount codes."""
        # Standard INR pricing: 1999 + 18% GST (359.82) = 2358.82
        res = self.client.get('/api/opportunities/pricing/?currency=INR')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["currency"], "INR")
        self.assertEqual(res.data["listing_fee"], 1999)
        self.assertEqual(res.data["final_payable_amount"], 2358.82)

        # Discount code STAGE10 (10% off)
        res_disc = self.client.get('/api/opportunities/pricing/?currency=INR&promo=STAGE10')
        self.assertEqual(res_disc.status_code, status.HTTP_200_OK)
        self.assertEqual(res_disc.data["discount_amount"], 199.9)

    def test_create_order_lifecycle(self):
        """Verifies payment order initialization in MongoDB."""
        payload = {
            "opportunityId": "opp-test-1",
            "productionCompany": "Marvelous Pictures",
            "title": "The Last Horizon",
            "productionCategory": "Film & TV",
            "productionType": "Feature Film",
            "currency": "INR",
            "talentNeeded": ["Actors"]
        }
        response = self.client.post('/api/opportunities/create-order/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertTrue(response.data["orderId"].startswith("ORD-JSP-"))
        self.assertEqual(response.data["opportunity"]["status"], "pending_payment")

    def test_confirm_payment_and_live_publishing(self):
        """Verifies payment confirmation transitions opportunity to live and records audit in payments collection."""
        payload = {
            "opportunityId": "opp-new-payment",
            "orderId": "ORD-JSP-TEST100",
            "txnId": "TXN-JSP-882199",
            "paymentMethod": "Juspay HyperCheckout",
            "amount": 2358.82,
            "currency": "INR"
        }
        response = self.client.post('/api/opportunities/confirm-payment/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["verified"])
        self.assertEqual(response.data["status"], "published")

        # Verify audit record saved in payments collection
        saved_payment = self.mock_payments.find_one({"order_id": "ORD-JSP-TEST100"})
        self.assertIsNotNone(saved_payment)
        self.assertEqual(saved_payment["txn_id"], "TXN-JSP-882199")
        self.assertEqual(saved_payment["payment_status"], "succeeded")
        self.assertTrue(len(saved_payment["audit_trail"]) >= 2)

        # Idempotency test: duplicate call should succeed without re-charging
        second_res = self.client.post('/api/opportunities/confirm-payment/', payload, format='json')
        self.assertEqual(second_res.status_code, status.HTTP_200_OK)
        self.assertTrue(second_res.data["idempotent"])


    def test_moderation_approve_and_reject(self):
        """Verifies moderation approval and rejection workflow."""
        # First save an opportunity pending review
        self.mock_opps.insert_one({
            "id": "opp-pending-mod",
            "title": "Indie Short",
            "status": "pending_review",
            "listingStatus": "pending_review"
        })

        # Approve
        appr_res = self.client.post('/api/opportunities/opp-pending-mod/approve/')
        self.assertEqual(appr_res.status_code, status.HTTP_200_OK)
        self.assertEqual(appr_res.data["opportunity"]["status"], "published")

        # Reject
        rej_res = self.client.post('/api/opportunities/opp-pending-mod/reject/', {"reason": "Policy violation"}, format='json')
        self.assertEqual(rej_res.status_code, status.HTTP_200_OK)
        self.assertEqual(rej_res.data["opportunity"]["status"], "rejected")
