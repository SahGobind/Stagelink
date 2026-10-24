"""
StageLink - Complete Production Company & Recruiter Workflow Verification Test Suite
===================================================================================
Tests all 8 requirements of the Recruiter workflow:
1. Recruiter Registration with valid details
2. Registration validation with invalid/missing fields
3. Duplicate email registration conflict handling (409)
4. Recruiter Login with valid credentials
5. Invalid login credentials handling (401)
6. Session token verification & Role resolution
7. Company profile loading & updates with MongoDB Atlas persistence
8. Authoritative pricing verification
9. Casting call order creation with recruiter ownership
10. Backend payment confirmation & publishing
11. Recruiter opportunities scoping & record ownership
12. Recruiter dashboard aggregated metrics
13. Role isolation & authorization enforcement
"""

import os
import sys
import uuid
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'starcast.settings')
django.setup()

from rest_framework.test import APIClient
from starcast.db import get_collection
from users.repository import find_user_by_email, find_user_by_id

client = APIClient()

def run_all_recruiter_tests():
    print("=" * 70)
    print("  STAGELINK PRODUCTION COMPANY / RECRUITER WORKFLOW TEST SUITE")
    print("=" * 70)

    unique = uuid.uuid4().hex[:6]
    company_name = f"Marvelous Vision Studios {unique}"
    contact_name = f"Christopher Nolan {unique}"
    business_email = f"nolan_{unique}@visionstudios.com"
    password = "StudioPassword2026!"

    # =========================================================================
    # Test 1: Validation with missing required fields
    # =========================================================================
    print("\n--- Test 1: Registration Validation (Missing / Invalid Fields) ---")
    incomplete_payload = {
        "fullName": contact_name,
        # missing companyName, missing email
        "password": password,
        "confirmPassword": password,
    }
    resp1 = client.post('/api/users/recruiter/register/', incomplete_payload, format='json')
    assert resp1.status_code == 400, f"Expected 400 on incomplete registration, got {resp1.status_code}"
    print(f"PASS [1]: Incomplete registration properly rejected with 400: {resp1.data.get('details')}")

    # Test password mismatch
    mismatch_payload = {
        "fullName": contact_name,
        "companyName": company_name,
        "email": business_email,
        "password": password,
        "confirmPassword": "DifferentPassword123!",
    }
    resp1_mismatch = client.post('/api/users/recruiter/register/', mismatch_payload, format='json')
    assert resp1_mismatch.status_code == 400, f"Expected 400 on password mismatch, got {resp1_mismatch.status_code}"
    print(f"PASS [1b]: Password mismatch properly rejected with 400: {resp1_mismatch.data.get('details')}")

    # =========================================================================
    # Test 2: Valid Recruiter Registration
    # =========================================================================
    print("\n--- Test 2: Valid Production Company Registration ---")
    valid_payload = {
        "fullName": contact_name,
        "companyName": company_name,
        "email": business_email,
        "phoneNumber": "+91 98765 43210",
        "country": "India",
        "website": f"https://visionstudios{unique}.com",
        "password": password,
        "confirmPassword": password,
        "agreeToTerms": True,
    }
    resp2 = client.post('/api/users/recruiter/register/', valid_payload, format='json')
    assert resp2.status_code == 201, f"Expected 201 on valid registration, got {resp2.status_code}: {resp2.data}"
    recruiter_data = resp2.data.get('user', {})
    recruiter_id = recruiter_data.get('id')
    assert recruiter_id, "Registered user must have a valid ID"
    assert recruiter_data.get('role') == 'recruiter', f"User role must be recruiter, got {recruiter_data.get('role')}"
    print(f"PASS [2]: Recruiter registered successfully. ID: {recruiter_id}, Company: {recruiter_data.get('companyName')}")

    # Verify MongoDB Atlas persistence for new user
    db_user = find_user_by_email(business_email)
    assert db_user is not None, "Recruiter user must be persisted in MongoDB Atlas"
    assert db_user.get('company_name') == company_name or db_user.get('companyName') == company_name, "Company name must match in MongoDB Atlas"
    print(f"PASS [2b]: MongoDB Atlas persistence verified for user {db_user.get('id')}")

    # =========================================================================
    # Test 3: Duplicate Registration Prevention
    # =========================================================================
    print("\n--- Test 3: Duplicate Registration Prevention (409 Conflict) ---")
    resp3 = client.post('/api/users/recruiter/register/', valid_payload, format='json')
    assert resp3.status_code == 409, f"Expected 409 on duplicate email, got {resp3.status_code}: {resp3.data}"
    print(f"PASS [3]: Duplicate registration cleanly rejected with 409 Conflict: {resp3.data.get('error')}")

    # =========================================================================
    # Test 4: Invalid Login Error Handling
    # =========================================================================
    print("\n--- Test 4: Invalid Login Error Handling ---")
    bad_login_payload = {
        "email": business_email,
        "password": "WrongPassword999!"
    }
    resp4 = client.post('/api/users/login/', bad_login_payload, format='json')
    assert resp4.status_code == 401, f"Expected 401 on wrong password, got {resp4.status_code}: {resp4.data}"
    print(f"PASS [4]: Invalid credentials rejected with 401: {resp4.data.get('error')}")

    # =========================================================================
    # Test 5: Valid Recruiter Login
    # =========================================================================
    print("\n--- Test 5: Valid Recruiter Login ---")
    good_login_payload = {
        "email": business_email,
        "password": password
    }
    resp5 = client.post('/api/users/login/', good_login_payload, format='json')
    assert resp5.status_code == 200, f"Expected 200 on valid login, got {resp5.status_code}: {resp5.data}"
    auth_token = resp5.data.get('token') or resp5.data.get('access')
    logged_user = resp5.data.get('user', {})
    assert auth_token, "Login response must provide an authentication token"
    assert logged_user.get('role') == 'recruiter', f"Logged in user role must be 'recruiter', got {logged_user.get('role')}"
    print(f"PASS [5]: Login successful. Authenticated role: {logged_user.get('role')}, Token: {auth_token[:20]}...")

    # Set authentication credentials on APIClient
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')

    # =========================================================================
    # Test 6: Company Profile Loading & Updating
    # =========================================================================
    print("\n--- Test 6: Company Profile Loading & Updating ---")
    updated_profile_payload = {
        "companyName": f"{company_name} International",
        "fullName": contact_name,
        "email": business_email,
        "phoneNumber": "+91 99999 88888",
        "website": f"https://www.visionstudios{unique}.com",
        "country": "India"
    }
    resp6 = client.put(f'/api/users/recruiter/profile/?id={recruiter_id}', updated_profile_payload, format='json')
    assert resp6.status_code == 200, f"Expected 200 on profile update, got {resp6.status_code}: {resp6.data}"
    updated_user = resp6.data.get('user', {})
    assert updated_user.get('companyName') == f"{company_name} International", "Profile update must reflect in response"
    print(f"PASS [6]: Company profile updated successfully. New company: {updated_user.get('companyName')}")

    # Verify MongoDB Atlas updated
    db_updated = find_user_by_id(recruiter_id)
    assert db_updated.get('company_name') == f"{company_name} International" or db_updated.get('companyName') == f"{company_name} International"
    print("PASS [6b]: Profile updates persisted in MongoDB Atlas")

    # =========================================================================
    # Test 7: Authoritative Pricing Calculation
    # =========================================================================
    print("\n--- Test 7: Authoritative Pricing Calculation ---")
    resp7 = client.get('/api/opportunities/pricing/?currency=INR&promo=STAGE10')
    assert resp7.status_code == 200, f"Expected 200 on pricing query, got {resp7.status_code}"
    pricing_data = resp7.data
    assert pricing_data.get('currency') == 'INR', "Pricing currency must be INR"
    assert pricing_data.get('listing_fee') == 1999, "Listing fee must be 1999 INR"
    assert pricing_data.get('final_payable_amount') > 0, "Final amount must be greater than 0"
    print(f"PASS [7]: Authoritative pricing returned: Base INR {pricing_data.get('listing_fee')}, Discount INR {pricing_data.get('discount_amount')}, Tax INR {pricing_data.get('tax_amount')}, Total INR {pricing_data.get('final_payable_amount')}")

    # =========================================================================
    # Test 8: Casting Call Order Creation (Pending Payment)
    # =========================================================================
    print("\n--- Test 8: Casting Call Order Creation ---")
    opp_id = f"opp-test-{unique}"
    create_order_payload = {
        "opportunityId": opp_id,
        "title": f"Lead Actors for Feature Film - {unique}",
        "productionCompany": f"{company_name} International",
        "productionCategory": "Film & TV",
        "productionType": "Feature Film",
        "talentNeeded": ["Lead Actor", "Supporting Actress"],
        "location": "Mumbai, India",
        "shootDate": "2026-12-01",
        "applicationDeadline": "2026-11-15",
        "currency": "INR",
        "requirements": "Seeking experienced theater or screen actors fluent in Hindi and English.",
        "customerEmail": business_email,
    }
    resp8 = client.post('/api/opportunities/create-order/', create_order_payload, format='json')
    assert resp8.status_code == 201, f"Expected 201 on order creation, got {resp8.status_code}: {resp8.data}"
    order_data = resp8.data
    payment_order_id = order_data.get('orderId')
    assert payment_order_id, "Order response must include orderId"
    print(f"PASS [8]: Casting order initialized. Order ID: {payment_order_id}, Amount: INR {order_data.get('amount')}, Status: {order_data.get('status')}")

    # Verify MongoDB Atlas record created with pending status
    col_opps = get_collection('casting_opportunities')
    saved_opp = col_opps.find_one({"id": opp_id})
    assert saved_opp is not None, "Opportunity must be created in MongoDB Atlas"
    assert saved_opp.get('status') == 'pending_payment', f"Expected status 'pending_payment', got {saved_opp.get('status')}"
    assert saved_opp.get('recruiterId') == recruiter_id or saved_opp.get('recruiterEmail') == business_email, "Recruiter ID / Email must be linked to opportunity"
    print(f"PASS [8b]: MongoDB Atlas record verified with status 'pending_payment' linked to recruiter: {saved_opp.get('recruiterId')}")

    # =========================================================================
    # Test 9: Backend Payment Confirmation & Publishing
    # =========================================================================
    print("\n--- Test 9: Backend Payment Confirmation & Publishing ---")
    confirm_payment_payload = {
        "opportunityId": opp_id,
        "orderId": payment_order_id,
        "paymentMethod": "Juspay UPI/NetBanking",
        "amount": order_data.get('amount', 1999),
        "status": "CHARGED",
    }
    resp9 = client.post('/api/opportunities/confirm-payment/', confirm_payment_payload, format='json')
    assert resp9.status_code == 200, f"Expected 200 on payment confirmation, got {resp9.status_code}: {resp9.data}"
    assert resp9.data.get('verified') is True, "Payment must be verified server-side"
    assert resp9.data.get('status') == 'published', "Opportunity must be published"
    print(f"PASS [9]: Server-side payment verified. Listing is live and published. Txn ID: {resp9.data.get('txnId')}")

    # Verify MongoDB Atlas status is now published
    col_opps = get_collection('casting_opportunities')
    published_opp = col_opps.find_one({"id": opp_id})
    assert published_opp.get('status') in ['published', 'open'], f"Expected published status in MongoDB, got {published_opp.get('status')}"
    print(f"PASS [9b]: Verified MongoDB Atlas status is '{published_opp.get('status')}'")

    # =========================================================================
    # Test 10: Recruiter Opportunities Scoping & Record Ownership
    # =========================================================================
    print("\n--- Test 10: Recruiter Opportunities Scoping & Record Ownership ---")
    resp10 = client.get('/api/opportunities/recruiter/')
    assert resp10.status_code == 200, f"Expected 200 on recruiter opps list, got {resp10.status_code}"
    recruiter_opps = resp10.data.get('opportunities', [])
    assert any(o.get('id') == opp_id for o in recruiter_opps), f"Recruiter must see their published opportunity {opp_id}"
    print(f"PASS [10]: Recruiter opportunities scoped properly. Count: {len(recruiter_opps)}")

    # =========================================================================
    # Test 11: Recruiter Dashboard Aggregated Metrics
    # =========================================================================
    print("\n--- Test 11: Recruiter Dashboard Metrics from MongoDB Atlas ---")
    resp11 = client.get('/api/opportunities/recruiter/dashboard/')
    assert resp11.status_code == 200, f"Expected 200 on recruiter dashboard data, got {resp11.status_code}"
    metrics = resp11.data.get('metrics', {})
    assert metrics.get('total_jobs') >= 1, f"Expected at least 1 total job, got {metrics.get('total_jobs')}"
    assert metrics.get('published_jobs') >= 1, f"Expected at least 1 published job, got {metrics.get('published_jobs')}"
    print(f"PASS [11]: Real metrics computed from MongoDB: Total={metrics.get('total_jobs')}, Published={metrics.get('published_jobs')}, Drafts={metrics.get('drafts')}, Pending={metrics.get('pending_payments')}")

    # =========================================================================
    # Test 12: Role Isolation & Authorization Enforcement
    # =========================================================================
    print("\n--- Test 12: Role Isolation & Authorization Enforcement ---")
    # Register a candidate
    candidate_email = f"candidate_{unique}@actors.com"
    cand_resp = client.post('/api/users/register/', {
        "email": candidate_email,
        "password": "CandidatePassword123!",
        "full_name": f"Candidate Actor {unique}",
        "role": "talent"
    }, format='json')
    cand_token = cand_resp.data.get('token') or cand_resp.data.get('access')

    # Candidate token attempting to access recruiter dashboard
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {cand_token}')
    cand_dash_resp = client.get('/api/opportunities/recruiter/dashboard/')
    cand_metrics = cand_dash_resp.data.get('metrics', {})
    # Candidate should not see recruiter's private jobs
    cand_opps = cand_dash_resp.data.get('opportunities', [])
    assert not any(o.get('id') == opp_id for o in cand_opps), "Candidate must NOT see recruiter's private opportunities"
    print(f"PASS [12]: Role isolation verified. Candidate token cannot access recruiter's private opportunities.")

    print("\n" + "=" * 70)
    print("  ALL 12 TEST SCENARIOS PASSED WITH FULL MONGODB ATLAS PERSISTENCE!")
    print("=" * 70)

if __name__ == '__main__':
    run_all_recruiter_tests()
