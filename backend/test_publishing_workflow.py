import os
import django
import sys
import json
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'starcast.settings')
django.setup()

from users.repository import (
    find_user_by_id, find_user_by_email, get_merged_candidate,
    validate_profile_completion, update_candidate_full_profile,
    list_talent
)
from rest_framework.test import APIClient

client = APIClient()

def run_tests():
    print("=== STARTING STAGELINK WORKFLOW TEST SUITE ===")
    unique_suffix = uuid.uuid4().hex[:6]
    
    # 1. Register new candidate
    candidate_email = f"actress_{unique_suffix}@stagelink.com"
    candidate_pass = "Password123!"
    reg_resp = client.post('/api/users/register/', {
        "email": candidate_email,
        "password": candidate_pass,
        "full_name": f"Priya Test {unique_suffix}",
        "name": f"Priya Test {unique_suffix}",
        "role": "talent"
    }, format='json')
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.data}"
    candidate_id = str(reg_resp.data.get('user', {}).get('id'))
    token = reg_resp.data.get('access') or reg_resp.data.get('token')
    print(f"PASS: 1. Candidate registered successfully with ID: {candidate_id}")
    
    # 2. Check initial profile is unpublished
    profile_before = get_merged_candidate(candidate_id)
    assert profile_before.get('is_published') is False, "Initial profile should not be published"
    print(f"PASS: 2. Initial profile is unpublished: is_published={profile_before.get('is_published')}")

    # 3. Test publish with missing required fields (should fail)
    incomplete_data = {
        "full_name": f"Priya Test {unique_suffix}",
        "location": "Mumbai, India"
        # missing headline, bio, skills, languages, avatar, category
    }
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    pub_fail_resp = client.post('/api/users/profile/publish/', incomplete_data, format='json')
    assert pub_fail_resp.status_code == 400, f"Expected 400 validation error, got: {pub_fail_resp.status_code}"
    missing_fields = pub_fail_resp.data.get('missing_fields', [])
    assert 'bio' in missing_fields or 'skills' in missing_fields, f"Missing fields not returned correctly: {pub_fail_resp.data}"
    print(f"PASS: 3. Publish correctly rejected incomplete profile with missing fields: {missing_fields}")

    # 4. Save and publish with complete valid profile
    complete_profile_data = {
        "full_name": f"Priya Test {unique_suffix}",
        "name": f"Priya Test {unique_suffix}",
        "headline": "Method Actress & Classical Dancer",
        "category": "Actor",
        "categories": ["Actor", "Dancer"],
        "location": "Mumbai, Maharashtra",
        "bio": "Experienced theater and screen actress trained in classical Bharatanatyam with 5 years experience.",
        "skills": ["Method Acting", "Voice Acting", "Classical Dance", "Stage Performance"],
        "languages": ["English", "Hindi"],
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "portfolio": [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
        ],
        "experience": "5+ years in professional theater and web series",
        "availability": "Available immediately"
    }
    pub_success_resp = client.post('/api/users/profile/publish/', complete_profile_data, format='json')
    assert pub_success_resp.status_code == 200, f"Expected 200 on valid publish, got: {pub_success_resp.status_code} - {pub_success_resp.data}"
    assert pub_success_resp.data.get('is_published') is True, "Profile must have is_published=True"
    print(f"PASS: 4. Profile published successfully via API")

    # 5. Verify persistence in MongoDB Atlas
    persisted = get_merged_candidate(candidate_id)
    assert persisted.get('is_published') is True, "MongoDB Atlas must have is_published=True"
    assert persisted.get('headline') == "Method Actress & Classical Dancer"
    assert "Method Acting" in persisted.get('skills', [])
    print("PASS: 5. Verified persistent profile in MongoDB Atlas collections (users & talent_profiles)")

    # 6. Verify profile visibility in Discover Talent API for Recruiter
    # Register recruiter
    recruiter_email = f"recruiter_{unique_suffix}@stagelink.com"
    rec_reg = client.post('/api/users/register/', {
        "email": recruiter_email,
        "password": "Password123!",
        "full_name": f"Casting Director {unique_suffix}",
        "name": f"Casting Director {unique_suffix}",
        "role": "recruiter"
    }, format='json')
    rec_token = rec_reg.data.get('access') or rec_reg.data.get('token')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {rec_token}')

    talent_resp = client.get('/api/users/?role=talent&published_only=true')
    assert talent_resp.status_code == 200
    talents = talent_resp.data if isinstance(talent_resp.data, list) else talent_resp.data.get('results', [])
    found = any(str(t.get('id') or t.get('_id')) == candidate_id for t in talents)
    assert found, f"Published candidate {candidate_id} must appear in published talent listing!"
    print(f"PASS: 6. Published candidate is visible in recruiter Discover Talent API (Total published: {len(talents)})")

    # 7. Search & filter in talent listing
    search_resp = client.get(f'/api/users/?role=talent&published_only=true&search={unique_suffix}')
    search_talents = search_resp.data if isinstance(search_resp.data, list) else search_resp.data.get('results', [])
    assert len(search_talents) >= 1, "Talent search by name/suffix must return the candidate"
    print("PASS: 7. Recruiter search and filter successfully finds the candidate")

    # 8. Test draft/unpublished isolation
    # Register an unpublished candidate
    unpub_email = f"draft_{unique_suffix}@stagelink.com"
    client.credentials() # clear credentials
    client.post('/api/users/register/', {
        "email": unpub_email,
        "password": "Password123!",
        "full_name": f"Draft User {unique_suffix}",
        "name": f"Draft User {unique_suffix}",
        "role": "talent"
    }, format='json')
    draft_user = find_user_by_email(unpub_email)
    draft_id = str(draft_user.get('_id') or draft_user.get('id'))
    
    # Recruiter checks list again
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {rec_token}')
    talent_resp2 = client.get('/api/users/?role=talent&published_only=true')
    talents2 = talent_resp2.data if isinstance(talent_resp2.data, list) else talent_resp2.data.get('results', [])
    assert not any(str(t.get('id') or t.get('_id')) == draft_id for t in talents2), "Unpublished/draft candidate must NOT appear in published list"
    print("PASS: 8. Draft/unpublished profile is strictly excluded from recruiter Discover Talent listing")

    # 9. Authorization check: candidate cannot edit another candidate's profile
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}') # back to candidate 1
    # Candidate 1 tries to publish/modify draft_id's profile
    malicious_resp = client.put(f'/api/users/profile/?id={draft_id}', {
        "full_name": "Hacked Name"
    }, format='json')
    assert malicious_resp.status_code in (403, 401), f"Cross-candidate profile update must be forbidden! Got {malicious_resp.status_code}"
    print(f"PASS: 9. Cross-candidate unauthorized profile modification correctly blocked ({malicious_resp.status_code})")

    # 10. Casting Call matching integration check
    # Check ranking candidate source
    from ranking.views import get_candidates_from_db
    ranking_candidates = get_candidates_from_db()
    ranking_found = any(str(c.get('id') or c.get('_id')) == candidate_id for c in ranking_candidates)
    assert ranking_found, "Candidate must be available for casting call matching algorithms"
    print(f"PASS: 10. Candidate is present in casting-call matching candidate pool (Count: {len(ranking_candidates)})")

    # 11. Application Submission test
    app_resp = client.post('/api/applications/', {
        "opportunity_id": "opp-test-1",
        "role_id": "role-lead",
        "candidate_id": candidate_id,
        "cover_message": "Excited to audition for this role!",
        "video_audition_url": "https://vimeo.com/testaudition"
    }, format='json')
    assert app_resp.status_code == 201, f"Application creation failed: {app_resp.data}"
    app_data = app_resp.data.get('application', {})
    assert app_data.get('status') == 'submitted'
    print(f"PASS: 11. Application submitted and stored in MongoDB Atlas with status: {app_data.get('status')}")

    print("\nALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
