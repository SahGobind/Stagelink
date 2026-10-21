"""
Serializers and validation schemas for StageLink Help & Support System.
Validates ticket creation, replies, internal staff notes, status changes, and assignments.
"""
from rest_framework import serializers

CANDIDATE_CATEGORIES = [
    "Account & Login",
    "Profile & Verification",
    "Casting Applications",
    "Auditions",
    "Messages",
    "Technical Problem",
    "Report a Listing",
    "Other",
]

RECRUITER_CATEGORIES = [
    "Account & Login",
    "Company Verification",
    "Job / Casting Call Posting",
    "Listing Fees & Payments",
    "Job Publishing",
    "Applications & Candidate Ranking",
    "Shortlisting & Auditions",
    "Messages",
    "Technical Problem",
    "Other",
]

ALLOWED_STATUSES = ["open", "in_progress", "waiting_user", "resolved", "closed"]
ALLOWED_PRIORITIES = ["low", "normal", "high", "urgent"]
ALLOWED_ROLES = ["candidate", "recruiter", "operations", "admin"]

ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf", ".docx", ".doc", ".mp4", ".mov", ".zip"]
MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class AttachmentSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    size = serializers.CharField(max_length=50, required=False, default="")
    size_bytes = serializers.IntegerField(required=False, default=0)
    type = serializers.CharField(max_length=100, required=False, default="application/octet-stream")
    url = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        name = attrs.get("name", "").lower()
        has_valid_ext = any(name.endswith(ext) for ext in ALLOWED_EXTENSIONS)
        if not has_valid_ext:
            raise serializers.ValidationError(
                f"Unsupported file type for attachment '{name}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        size_bytes = attrs.get("size_bytes", 0)
        if size_bytes > MAX_ATTACHMENT_SIZE_BYTES:
            raise serializers.ValidationError("Attachment size exceeds maximum limit of 10MB.")
        return attrs


class SupportTicketCreateSerializer(serializers.Serializer):
    category = serializers.CharField(max_length=100)
    subject = serializers.CharField(max_length=200, min_length=3)
    message = serializers.CharField(min_length=5)
    attachment = AttachmentSerializer(required=False, allow_null=True)
    
    # User Context (supplied by frontend or request)
    user_id = serializers.CharField(max_length=100, required=False, default="cand-aanya")
    user_name = serializers.CharField(max_length=150, required=False, default="StageLink User")
    user_email = serializers.EmailField(required=False, default="user@stagelink.com")
    user_role = serializers.ChoiceField(choices=ALLOWED_ROLES, required=False, default="candidate")
    company_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")

    def validate(self, attrs):
        role = attrs.get("user_role", "candidate")
        category = attrs.get("category", "").strip()

        valid_categories = RECRUITER_CATEGORIES if role in ["recruiter", "admin"] else CANDIDATE_CATEGORIES
        if category not in valid_categories and category not in CANDIDATE_CATEGORIES and category not in RECRUITER_CATEGORIES:
            raise serializers.ValidationError({
                "category": f"Invalid category '{category}'. Available categories: {', '.join(valid_categories)}"
            })
        return attrs


class SupportReplySerializer(serializers.Serializer):
    content = serializers.CharField(min_length=1)
    sender_id = serializers.CharField(max_length=100, required=False, default="")
    sender_name = serializers.CharField(max_length=150, required=False, default="")
    sender_role = serializers.ChoiceField(choices=ALLOWED_ROLES, required=False, default="candidate")
    attachment = AttachmentSerializer(required=False, allow_null=True)


class SupportInternalNoteSerializer(serializers.Serializer):
    note = serializers.CharField(min_length=2)
    author_id = serializers.CharField(max_length=100, required=False, default="admin-1")
    author_name = serializers.CharField(max_length=150, required=False, default="Operation Staff")


class SupportTicketUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ALLOWED_STATUSES, required=False)
    priority = serializers.ChoiceField(choices=ALLOWED_PRIORITIES, required=False)
    assigned_to = serializers.CharField(max_length=150, required=False, allow_blank=True)
    assigned_staff_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
