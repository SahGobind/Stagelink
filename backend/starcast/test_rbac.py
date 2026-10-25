"""
Automated Authorization & RBAC Test Suite
=========================================
Tests for StageLink Rule-Based Access Control (RBAC):
- Deny by default (unauthenticated requests rejected with 401)
- Role-based granular permissions (Super Admin, Admin, Recruiter, Candidate, User)
- Data isolation & IDOR prevention (Resource ownership enforcement)
- Privilege escalation prevention (Unprivileged role assignment, public admin registration, self-promotion)
- Dynamic role permission configuration
- Immutable security audit logging
"""

from django.test import SimpleTestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

from starcast.test_utils import MockCollection
from starcast.seeder import INITIAL_USERS, INITIAL_APPLICATIONS, INITIAL_OPPORTUNITIES
from starcast.rbac import Permissions, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS
from starcast.audit import query_audit_logs


class RBACTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        self.mock_users = MockCollection("users", initial_docs=INITIAL_USERS)
        self.mock_apps = MockCollection("applications", initial_docs=INITIAL_APPLICATIONS)
        self.mock_opps = MockCollection("casting_opportunities", initial_docs=INITIAL_OPPORTUNITIES)
        self.mock_roles = MockCollection("roles", initial_docs=[])
        self.mock_audit = MockCollection("audit_logs", initial_docs=[])

        self.patch_users = patch('users.repository.get_users_col', return_value=self.mock_users)
        self.patch_apps = patch('applications.repository.get_apps_col', return_value=self.mock_apps)
        self.patch_opps = patch('opportunities.repository.get_opps_col', return_value=self.mock_opps)
        self.patch_roles = patch('starcast.rbac.get_roles_col', return_value=self.mock_roles)
        self.patch_audit = patch('starcast.audit.get_audit_col', return_value=self.mock_audit)

        self.patch_users.start()
        self.patch_apps.start()
        self.patch_opps.start()
        self.patch_roles.start()
        self.patch_audit.start()

    def tearDown(self):
        self.patch_users.stop()
        self.patch_apps.stop()
        self.patch_opps.stop()
        self.patch_roles.stop()
        self.patch_audit.stop()

    # ==========================================================================
    # 1. DENY ACCESS BY DEFAULT (UNAUTHENTICATED)
    # ==========================================================================

    def test_deny_by_default_unauthenticated_roles(self):
        """Unauthenticated requests to view roles must be rejected with 401."""
        response = self.client.get('/api/users/roles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["code"], "AUTHENTICATION_REQUIRED")

    def test_deny_by_default_unauthenticated_audit_logs(self):
        """Unauthenticated requests to view audit logs must be rejected with 401."""
        response = self.client.get('/api/users/audit-logs/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["code"], "AUTHENTICATION_REQUIRED")

    def test_deny_by_default_unauthenticated_role_assignment(self):
        """Unauthenticated requests to manage roles must be rejected with 401."""
        response = self.client.post('/api/users/manage-role/', {
            "user_id": "cand-rohit",
            "role": "admin"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["code"], "AUTHENTICATION_REQUIRED")

    def test_deny_by_default_unauthenticated_applications_list(self):
        """Unauthenticated requests to list applications must be rejected with 401."""
        response = self.client.get('/api/applications/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_deny_by_default_unauthenticated_opportunity_creation(self):
        """Unauthenticated requests to create opportunities must be rejected with 401."""
        response = self.client.post('/api/opportunities/', {
            "title": "Anonymous Feature Film"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ==========================================================================
    # 2. ROLE-BASED GRANULAR PERMISSIONS
    # ==========================================================================

    def test_super_admin_can_view_roles_and_audit_logs(self):
        """Super Admin can access roles and audit log endpoints."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-super_admin-superadmin-1-token123')
        roles_res = self.client.get('/api/users/roles/')
        self.assertEqual(roles_res.status_code, status.HTTP_200_OK)
        self.assertIn("roles", roles_res.data)

        audit_res = self.client.get('/api/users/audit-logs/')
        self.assertEqual(audit_res.status_code, status.HTTP_200_OK)

    def test_admin_can_view_roles_but_cannot_modify_role_permissions(self):
        """Admin can view roles, but cannot modify role permissions (Super Admin only)."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-admin-admin-1-token123')
        get_res = self.client.get('/api/users/roles/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)

        # PUT role modification requires role:manage (Super Admin)
        put_res = self.client.put('/api/users/roles/recruiter/', {
            "permissions": [Permissions.OPPORTUNITY_CREATE]
        }, format='json')
        self.assertEqual(put_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(put_res.data["code"], "PERMISSION_DENIED")

    def test_candidate_forbidden_from_admin_endpoints(self):
        """Candidate cannot access roles, audit logs, or role management."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-aanya-token123')

        roles_res = self.client.get('/api/users/roles/')
        self.assertEqual(roles_res.status_code, status.HTTP_403_FORBIDDEN)

        audit_res = self.client.get('/api/users/audit-logs/')
        self.assertEqual(audit_res.status_code, status.HTTP_403_FORBIDDEN)

        manage_res = self.client.post('/api/users/manage-role/', {
            "user_id": "cand-aanya",
            "role": "admin"
        }, format='json')
        self.assertEqual(manage_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_forbidden_from_creating_opportunities(self):
        """Candidate lacks opportunity:create permission."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-aanya-token123')
        res = self.client.post('/api/opportunities/', {
            "title": "Unauthorized Candidate Opportunity"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ==========================================================================
    # 3. RESOURCE OWNERSHIP & IDOR PREVENTION
    # ==========================================================================

    def test_candidate_cannot_access_another_candidates_application(self):
        """Candidate A cannot view Candidate B's private audition application (IDOR prevention)."""
        # app-101 belongs to cand-1
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-rohit-token123')
        res = self.client.get('/api/applications/app-101/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.data["code"], "FORBIDDEN_RESOURCE_ACCESS")

    def test_candidate_cannot_withdraw_another_candidates_application(self):
        """Candidate A cannot withdraw Candidate B's application."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-rohit-token123')
        res = self.client.post('/api/applications/app-101/withdraw/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_cannot_update_application_status(self):
        """Candidate cannot update application status (e.g. self-shortlisting)."""
        # Even on their own application, candidates cannot update status
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-1-token123')
        res = self.client.patch('/api/applications/app-101/status/', {
            "status": "selected"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_recruiter_cannot_delete_another_recruiters_opportunity(self):
        """Recruiter A cannot delete Recruiter B's casting call."""
        # Insert opportunity owned by rec-marcus
        self.mock_opps.insert_one({
            "id": "opp-marcus",
            "recruiterId": "rec-marcus",
            "title": "Marcus's Movie",
            "status": "draft"
        })
        # Authenticate as a different recruiter (rec-other)
        self.mock_users.insert_one({
            "id": "rec-other",
            "email": "other.recruiter@example.com",
            "role": "recruiter"
        })
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-recruiter-rec-other-token123')

        res = self.client.delete('/api/opportunities/opp-marcus/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.data["code"], "FORBIDDEN_RESOURCE_ACCESS")

    def test_data_isolation_applications_query(self):
        """Candidate querying /api/applications/ only receives their own applications."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-1-token123')
        # Even if cand-1 asks for candidate_id=cand-2, backend isolates to cand-1
        res = self.client.get('/api/applications/?candidate_id=cand-2')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for app in res.data["results"]:
            self.assertEqual(app["candidate_id"], "cand-1")

    # ==========================================================================
    # 4. PRIVILEGE ESCALATION PREVENTION
    # ==========================================================================

    def test_prevent_public_admin_or_superadmin_registration(self):
        """Public registration cannot assign admin or super_admin roles."""
        payload = {
            "full_name": "Attacker Hacker",
            "email": "hacker@example.com",
            "password": "Password123!",
            "role": "super_admin"
        }
        res = self.client.post('/api/users/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.data["code"], "FORBIDDEN_ROLE")

    def test_prevent_user_profile_role_tampering(self):
        """Users cannot change their role via profile update payload."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-candidate-cand-aanya-token123')
        res = self.client.put('/api/users/profile/?id=cand-aanya', {
            "headline": "Updated Headline",
            "role": "super_admin"  # Tampered field
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Verify role in DB remained candidate
        user = self.mock_users.find_one({"id": "cand-aanya"})
        self.assertEqual(user["role"], "candidate")

    def test_admin_cannot_promote_anyone_to_super_admin(self):
        """Admin role cannot assign super_admin role."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-admin-admin-1-token123')
        res = self.client.post('/api/users/manage-role/', {
            "user_id": "cand-rohit",
            "role": "super_admin"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.data["code"], "PRIVILEGE_ESCALATION_FORBIDDEN")

    def test_user_cannot_modify_own_role(self):
        """Admins or users cannot modify their own role (prevents self-elevation)."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-admin-admin-1-token123')
        res = self.client.post('/api/users/manage-role/', {
            "user_id": "admin-1",
            "role": "super_admin"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.data["code"], "SELF_MODIFICATION_FORBIDDEN")

    def test_cannot_demote_root_super_admin(self):
        """Root Super Admin account cannot be demoted."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-super_admin-superadmin-1-token123')
        # Create second superadmin to attempt demoting root superadmin
        self.mock_users.insert_one({
            "id": "superadmin-2",
            "email": "sa2@stagelink.com",
            "role": "super_admin"
        })
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-super_admin-superadmin-2-token123')
        res = self.client.post('/api/users/manage-role/', {
            "user_id": "superadmin-1",
            "role": "candidate"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.data["code"], "ROOT_ADMIN_IMMUTABLE")

    # ==========================================================================
    # 5. DYNAMIC ROLE PERMISSION CONFIGURATION
    # ==========================================================================

    def test_super_admin_can_update_role_permissions(self):
        """Super Admin can update configured permissions for a role."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-super_admin-superadmin-1-token123')
        new_perms = [
            Permissions.OPPORTUNITY_VIEW_PUBLIC,
            Permissions.APPLICATION_CREATE,
            Permissions.SUPPORT_CREATE
        ]
        res = self.client.put('/api/users/roles/user/', {
            "permissions": new_perms
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["permissions"], new_perms)

    def test_super_admin_cannot_alter_super_admin_role(self):
        """Super admin role permissions are immutable."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer stg-token-super_admin-superadmin-1-token123')
        res = self.client.put('/api/users/roles/super_admin/', {
            "permissions": []
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["code"], "IMMUTABLE_ROLE")

    # ==========================================================================
    # 6. SECURITY AUDIT LOGGING
    # ==========================================================================

    def test_privilege_escalation_generates_audit_log(self):
        """Privilege escalation attempts create an immutable audit log entry."""
        payload = {
            "full_name": "Audit Test Hacker",
            "email": "audit_hacker@example.com",
            "password": "Password123!",
            "role": "admin"
        }
        self.client.post('/api/users/register/', payload, format='json')

        logs = query_audit_logs(action="PRIVILEGE_ESCALATION_BLOCKED")
        self.assertTrue(len(logs) > 0)
        self.assertEqual(logs[0]["status"], "DENIED")
        self.assertEqual(logs[0]["resource_type"], "registration")
