"""
StageLink Rule-Based Access Control (RBAC) System
=================================================
Centralized role definitions, granular permissions, role hierarchy,
and permission resolution engine.

Roles Supported:
- super_admin: Full system control, role management, audit inspection.
- admin: Platform administration, user moderation, operational support.
- user: Base platform user (candidates, recruiters, standard users).
- candidate (persona of user): Profile management, auditions, application tracking.
- recruiter (persona of user): Casting calls, applicant reviewing, company profile.
"""

from typing import Set, Dict, List, Optional, Any
import logging
from starcast.db import get_collection

logger = logging.getLogger(__name__)

# ==============================================================================
# GRANULAR PERMISSION CONSTANTS (Resource:Action)
# ==============================================================================

class Permissions:
    # Opportunities / Casting Calls
    OPPORTUNITY_VIEW_PUBLIC = "opportunity:view_public"
    OPPORTUNITY_VIEW_OWN = "opportunity:view_own"
    OPPORTUNITY_VIEW_ALL = "opportunity:view_all"
    OPPORTUNITY_CREATE = "opportunity:create"
    OPPORTUNITY_UPDATE_OWN = "opportunity:update_own"
    OPPORTUNITY_UPDATE_ALL = "opportunity:update_all"
    OPPORTUNITY_DELETE_OWN = "opportunity:delete_own"
    OPPORTUNITY_DELETE_ALL = "opportunity:delete_all"

    # Applications
    APPLICATION_CREATE = "application:create"
    APPLICATION_VIEW_OWN = "application:view_own"
    APPLICATION_VIEW_RECRUITER = "application:view_recruiter"
    APPLICATION_VIEW_ALL = "application:view_all"
    APPLICATION_UPDATE_STATUS = "application:update_status"
    APPLICATION_WITHDRAW_OWN = "application:withdraw_own"
    APPLICATION_DELETE_ALL = "application:delete_all"

    # User Profiles
    PROFILE_VIEW_PUBLIC = "profile:view_public"
    PROFILE_VIEW_OWN = "profile:view_own"
    PROFILE_VIEW_ALL = "profile:view_all"
    PROFILE_UPDATE_OWN = "profile:update_own"
    PROFILE_UPDATE_ALL = "profile:update_all"
    PROFILE_DELETE_ALL = "profile:delete_all"

    # Support Tickets
    SUPPORT_CREATE = "support:create"
    SUPPORT_VIEW_OWN = "support:view_own"
    SUPPORT_VIEW_ALL = "support:view_all"
    SUPPORT_UPDATE_STATUS = "support:update_status"
    SUPPORT_REPLY = "support:reply"

    # Roles & Access Control Management
    ROLE_VIEW = "role:view"
    ROLE_ASSIGN = "role:assign"
    ROLE_MANAGE = "role:manage"

    # Audit Logs
    AUDIT_VIEW = "audit:view"
    AUDIT_EXPORT = "audit:export"

    # Area Access
    ADMIN_ACCESS = "admin:access"
    SUPERADMIN_ACCESS = "superadmin:access"


# All defined permissions in the system
ALL_PERMISSIONS: List[str] = [
    getattr(Permissions, attr)
    for attr in dir(Permissions)
    if not attr.startswith("_") and isinstance(getattr(Permissions, attr), str)
]

# ==============================================================================
# DEFAULT ROLE PERMISSIONS
# ==============================================================================

DEFAULT_ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "super_admin": ALL_PERMISSIONS,  # Super admin holds all permissions

    "admin": [
        Permissions.OPPORTUNITY_VIEW_PUBLIC,
        Permissions.OPPORTUNITY_VIEW_OWN,
        Permissions.OPPORTUNITY_VIEW_ALL,
        Permissions.OPPORTUNITY_CREATE,
        Permissions.OPPORTUNITY_UPDATE_ALL,
        Permissions.OPPORTUNITY_DELETE_ALL,

        Permissions.APPLICATION_VIEW_OWN,
        Permissions.APPLICATION_VIEW_RECRUITER,
        Permissions.APPLICATION_VIEW_ALL,
        Permissions.APPLICATION_UPDATE_STATUS,
        Permissions.APPLICATION_DELETE_ALL,

        Permissions.PROFILE_VIEW_PUBLIC,
        Permissions.PROFILE_VIEW_OWN,
        Permissions.PROFILE_VIEW_ALL,
        Permissions.PROFILE_UPDATE_ALL,

        Permissions.SUPPORT_CREATE,
        Permissions.SUPPORT_VIEW_ALL,
        Permissions.SUPPORT_UPDATE_STATUS,
        Permissions.SUPPORT_REPLY,

        Permissions.ROLE_VIEW,
        Permissions.ROLE_ASSIGN,
        Permissions.AUDIT_VIEW,
        Permissions.ADMIN_ACCESS,
    ],

    "operations": [
        Permissions.OPPORTUNITY_VIEW_PUBLIC,
        Permissions.OPPORTUNITY_VIEW_ALL,
        Permissions.APPLICATION_VIEW_ALL,
        Permissions.PROFILE_VIEW_PUBLIC,
        Permissions.PROFILE_VIEW_ALL,
        Permissions.SUPPORT_CREATE,
        Permissions.SUPPORT_VIEW_ALL,
        Permissions.SUPPORT_UPDATE_STATUS,
        Permissions.SUPPORT_REPLY,
        Permissions.ADMIN_ACCESS,
    ],

    "recruiter": [
        Permissions.OPPORTUNITY_VIEW_PUBLIC,
        Permissions.OPPORTUNITY_VIEW_OWN,
        Permissions.OPPORTUNITY_CREATE,
        Permissions.OPPORTUNITY_UPDATE_OWN,
        Permissions.OPPORTUNITY_DELETE_OWN,

        Permissions.APPLICATION_VIEW_RECRUITER,
        Permissions.APPLICATION_UPDATE_STATUS,

        Permissions.PROFILE_VIEW_PUBLIC,
        Permissions.PROFILE_VIEW_OWN,
        Permissions.PROFILE_UPDATE_OWN,

        Permissions.SUPPORT_CREATE,
        Permissions.SUPPORT_VIEW_OWN,
        Permissions.SUPPORT_REPLY,

        Permissions.ADMIN_ACCESS,  # Recruiter dashboard / admin portal access
    ],

    "candidate": [
        Permissions.OPPORTUNITY_VIEW_PUBLIC,

        Permissions.APPLICATION_CREATE,
        Permissions.APPLICATION_VIEW_OWN,
        Permissions.APPLICATION_WITHDRAW_OWN,

        Permissions.PROFILE_VIEW_PUBLIC,
        Permissions.PROFILE_VIEW_OWN,
        Permissions.PROFILE_UPDATE_OWN,

        Permissions.SUPPORT_CREATE,
        Permissions.SUPPORT_VIEW_OWN,
        Permissions.SUPPORT_REPLY,
    ],

    # Talent synonym of candidate
    "talent": [
        Permissions.OPPORTUNITY_VIEW_PUBLIC,

        Permissions.APPLICATION_CREATE,
        Permissions.APPLICATION_VIEW_OWN,
        Permissions.APPLICATION_WITHDRAW_OWN,

        Permissions.PROFILE_VIEW_PUBLIC,
        Permissions.PROFILE_VIEW_OWN,
        Permissions.PROFILE_UPDATE_OWN,

        Permissions.SUPPORT_CREATE,
        Permissions.SUPPORT_VIEW_OWN,
        Permissions.SUPPORT_REPLY,
    ],

    # General standard user role (equivalent to baseline candidate)
    "user": [
        Permissions.OPPORTUNITY_VIEW_PUBLIC,

        Permissions.APPLICATION_CREATE,
        Permissions.APPLICATION_VIEW_OWN,
        Permissions.APPLICATION_WITHDRAW_OWN,

        Permissions.PROFILE_VIEW_PUBLIC,
        Permissions.PROFILE_VIEW_OWN,
        Permissions.PROFILE_UPDATE_OWN,

        Permissions.SUPPORT_CREATE,
        Permissions.SUPPORT_VIEW_OWN,
        Permissions.SUPPORT_REPLY,
    ],
}

# Role hierarchy levels for privilege elevation checks
ROLE_HIERARCHY: Dict[str, int] = {
    "super_admin": 100,
    "admin": 80,
    "operations": 60,
    "recruiter": 40,
    "candidate": 20,
    "talent": 20,
    "user": 20,
    "guest": 0,
}


def get_roles_col():
    """Retrieve PyMongo collection for dynamic role definitions."""
    try:
        return get_collection("roles")
    except Exception:
        return None


def get_role_permissions(role_name: str) -> Set[str]:
    """
    Resolves permissions for a role, checking database configuration
    with fallback to DEFAULT_ROLE_PERMISSIONS.
    """
    if not role_name:
        return set()

    clean_role = role_name.strip().lower()

    # Super Admin always possesses all permissions
    if clean_role == "super_admin":
        return set(ALL_PERMISSIONS)

    col = get_roles_col()
    if col is not None:
        try:
            doc = col.find_one({"name": clean_role})
            if doc and "permissions" in doc and isinstance(doc["permissions"], list):
                return set(doc["permissions"])
        except Exception as e:
            logger.debug("Failed to query roles collection: %s", e)

    # Fallback to in-code defaults
    return set(DEFAULT_ROLE_PERMISSIONS.get(clean_role, []))


def get_user_permissions(user: Optional[Dict[str, Any]]) -> Set[str]:
    """
    Computes effective permission set for a user based on their role
    and any custom permissions directly granted to the user.
    """
    if not user:
        return set()

    role = user.get("role", "guest")
    perms = get_role_permissions(role)

    # Add any explicitly granted direct permissions
    direct_perms = user.get("custom_permissions") or user.get("permissions") or []
    if isinstance(direct_perms, list):
        perms = perms.union(set(direct_perms))

    return perms


def user_has_permission(user: Optional[Dict[str, Any]], permission: str) -> bool:
    """
    Returns True if user has the specified permission.
    Denies access by default if user is None or permission is missing.
    """
    if not user or not permission:
        return False

    # Super admin bypass
    if user.get("role") == "super_admin":
        return True

    perms = get_user_permissions(user)
    return permission in perms


def can_assign_role(actor: Optional[Dict[str, Any]], target_role: str) -> bool:
    """
    Checks if actor has authorization to assign `target_role`.
    - Only super_admin can assign super_admin or admin.
    - admin can assign operations, recruiter, candidate, user.
    - non-admins cannot assign any roles.
    """
    if not actor:
        return False

    actor_role = actor.get("role", "guest")
    actor_level = ROLE_HIERARCHY.get(actor_role, 0)
    target_level = ROLE_HIERARCHY.get(target_role, 0)

    # Only super_admin can assign super_admin or admin roles
    if target_role in ("super_admin", "admin"):
        return actor_role == "super_admin"

    # Actor must have strictly higher hierarchy level than target role
    return actor_level > target_level and actor_level >= ROLE_HIERARCHY["admin"]
