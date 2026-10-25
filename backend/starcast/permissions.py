"""
StageLink Centralized Permission & Authorization Framework
==========================================================
DRF permission classes and reusable authorization guards enforcing:
- Principle of Least Privilege
- Deny by default
- IDOR (Insecure Direct Object Reference) prevention
- Resource ownership validation & data isolation
- Automated security audit logging on access denial
"""

from typing import Optional, Dict, Any, List, Union
from rest_framework import permissions, status
from rest_framework.response import Response
from starcast.utils import get_auth_user_from_request
from starcast.rbac import user_has_permission, Permissions
from starcast.audit import log_audit_event
import logging

logger = logging.getLogger(__name__)


class IsAuthenticated(permissions.BasePermission):
    """
    Deny access by default unless a valid authenticated user session is verified.
    """
    message = "Authentication credentials were not provided or are invalid."
    code = "AUTHENTICATION_REQUIRED"

    def has_permission(self, request, view):
        user = get_auth_user_from_request(request)
        if not user:
            return False
        # Attach authoritative user to request for downstream handlers
        request.auth_user = user
        return True


class HasPermission:
    """
    DRF permission class constructor checking for a specific granular RBAC permission.
    Example: permission_classes = [HasPermission(Permissions.OPPORTUNITY_CREATE)]
    """
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self):
        perm_to_check = self.required_permission

        class _CustomPermission(permissions.BasePermission):
            message = f"You do not possess the required permission: {perm_to_check}."
            code = "PERMISSION_DENIED"

            def has_permission(self, request, view):
                user = getattr(request, "auth_user", None) or get_auth_user_from_request(request)
                if not user:
                    log_audit_event(
                        action="ACCESS_DENIED_UNAUTHENTICATED",
                        resource_type=getattr(view, "resource_name", "api"),
                        status="DENIED",
                        reason=f"Missing auth for {perm_to_check}",
                        request=request
                    )
                    return False

                request.auth_user = user
                has_perm = user_has_permission(user, perm_to_check)
                if not has_perm:
                    log_audit_event(
                        action="PERMISSION_DENIED",
                        actor=user,
                        resource_type=getattr(view, "resource_name", "api"),
                        status="DENIED",
                        reason=f"User lacks required permission: {perm_to_check}",
                        details={"required_permission": perm_to_check, "user_role": user.get("role")},
                        request=request
                    )
                return has_perm

        return _CustomPermission()


# Direct function-level authorization helpers for view methods

def check_permission(
    request,
    required_permission: str,
    resource_type: str = "resource",
    resource_id: Optional[str] = None
) -> Optional[Response]:
    """
    Centralized procedural check for views.
    Returns None if authorized.
    Returns Response(401) or Response(403) with audit log if unauthorized.
    """
    user = getattr(request, "auth_user", None) or get_auth_user_from_request(request)
    if not user:
        log_audit_event(
            action="ACCESS_DENIED_UNAUTHENTICATED",
            resource_type=resource_type,
            resource_id=resource_id,
            status="DENIED",
            reason="Unauthenticated request",
            request=request
        )
        return Response({
            "error": "Authentication credentials were not provided or are invalid.",
            "code": "AUTHENTICATION_REQUIRED",
            "required_permission": required_permission
        }, status=status.HTTP_401_UNAUTHORIZED)

    request.auth_user = user

    if not user_has_permission(user, required_permission):
        log_audit_event(
            action="PERMISSION_DENIED",
            actor=user,
            resource_type=resource_type,
            resource_id=resource_id,
            status="DENIED",
            reason=f"Missing required permission '{required_permission}'",
            details={"user_role": user.get("role"), "required_permission": required_permission},
            request=request
        )
        return Response({
            "error": f"You do not possess the required permission: {required_permission}.",
            "code": "PERMISSION_DENIED",
            "required_permission": required_permission,
            "current_role": user.get("role", "guest")
        }, status=status.HTTP_403_FORBIDDEN)

    return None


def check_resource_ownership(
    request,
    resource: Dict[str, Any],
    owner_keys: Union[str, List[str]] = "user_id",
    admin_permission: Optional[str] = None,
    resource_type: str = "resource",
    resource_id: Optional[str] = None
) -> Optional[Response]:
    """
    Validates that the authenticated user owns `resource` OR possesses the administrative override permission.
    Prevents IDOR (Insecure Direct Object Reference).
    """
    user = getattr(request, "auth_user", None) or get_auth_user_from_request(request)
    if not user:
        return Response({
            "error": "Authentication required to access this resource.",
            "code": "AUTHENTICATION_REQUIRED"
        }, status=status.HTTP_401_UNAUTHORIZED)

    request.auth_user = user
    user_id = user.get("id") or str(user.get("_id", ""))

    # 1. Super Admin bypasses ownership
    if user.get("role") == "super_admin":
        return None

    # 2. Check administrative override permission if specified
    if admin_permission and user_has_permission(user, admin_permission):
        return None

    # 3. Check ownership matching
    if isinstance(owner_keys, str):
        owner_keys = [owner_keys]

    user_identifiers = {
        str(user_id),
        str(user.get("email", "")).lower().strip(),
        str(user.get("companyName", "")).lower().strip(),
        str(user.get("company_name", "")).lower().strip(),
    }
    user_identifiers.discard("")

    is_owner = False
    for key in owner_keys:
        val = resource.get(key)
        if val is not None:
            clean_val = str(val).lower().strip() if isinstance(val, str) else str(val)
            if clean_val in user_identifiers or str(val) in user_identifiers:
                is_owner = True
                break

    if not is_owner:
        log_audit_event(
            action="IDOR_ATTEMPT_BLOCKED",
            actor=user,
            resource_type=resource_type,
            resource_id=resource_id or resource.get("id"),
            status="DENIED",
            reason=f"User {user_id} attempted unauthorized access to {resource_type}",
            details={
                "attempted_resource_id": resource.get("id"),
                "expected_owners": [resource.get(k) for k in owner_keys]
            },
            request=request
        )
        return Response({
            "error": "You are not authorized to access or modify this resource.",
            "code": "FORBIDDEN_RESOURCE_ACCESS"
        }, status=status.HTTP_403_FORBIDDEN)

    return None
