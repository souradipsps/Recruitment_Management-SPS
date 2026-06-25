"""
recruitment/serializers.py
DRF serializers for all models — includes validation, nested data, and custom fields.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, CandidateProfile, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting,
    JobApplication, GeneralApplication, Panelist, Interview,
    Offer, OnboardingRecord, Notification,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _auto_id(prefix: str, model, id_field: str = "id") -> str:
    """Generate a sequential ID like JR-2026-0001."""
    from datetime import date
    year = date.today().year
    count = model.objects.count() + 1
    return f"{prefix}-{year}-{count:04d}"


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH SERIALIZERS
# ═══════════════════════════════════════════════════════════════════════════════

class RegisterSerializer(serializers.ModelSerializer):
    """Candidate self-registration from the career page. Uses email + password only."""
    password         = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = [
            "id", "first_name", "last_name", "email",
            "phone", "password", "confirm_password",
        ]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name":  {"required": True},
            "email":      {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        # username is auto-set to email inside User.save()
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["email"],   # required by AbstractUser
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
        )
        user.role = "candidate"
        user.save()
        CandidateProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Read-only user info returned after login / in profile."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        # username is intentionally excluded — email is the identity
        fields = ["id", "email", "first_name", "last_name", "phone", "role", "full_name"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


# ═══════════════════════════════════════════════════════════════════════════════
# CANDIDATE PROFILE
# ═══════════════════════════════════════════════════════════════════════════════

class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = CandidateProfile
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]


class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    """Used by candidate to update their own profile."""
    class Meta:
        model = CandidateProfile
        exclude = ["user", "created_at", "updated_at"]


# ═══════════════════════════════════════════════════════════════════════════════
# EXISTING ROLES
# ═══════════════════════════════════════════════════════════════════════════════

class ExistingRoleSerializer(serializers.ModelSerializer):
    vacancies = serializers.ReadOnlyField()

    class Meta:
        model  = ExistingRole
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        if not validated_data.get("role_id"):
            validated_data["role_id"] = _auto_id("ROL", ExistingRole)
        return super().create(validated_data)


# ═══════════════════════════════════════════════════════════════════════════════
# ROLE REQUESTS
# ═══════════════════════════════════════════════════════════════════════════════

class RoleRequestSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = RoleRequest
        fields = "__all__"
        read_only_fields = ["request_id", "date", "reviewed_at", "created_by"]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else obj.submitted_by

    def create(self, validated_data):
        validated_data["request_id"] = _auto_id("RR", RoleRequest)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class RoleRequestStatusSerializer(serializers.ModelSerializer):
    """Minimal serializer for approving / rejecting a role request."""
    class Meta:
        model  = RoleRequest
        fields = ["status", "reviewer_note"]


# ═══════════════════════════════════════════════════════════════════════════════
# JOB REQUESTS
# ═══════════════════════════════════════════════════════════════════════════════

class JobRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model  = JobRequest
        fields = "__all__"
        read_only_fields = ["request_id", "created_at", "updated_at", "created_by"]

    def create(self, validated_data):
        validated_data["request_id"] = _auto_id("JR", JobRequest)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


# ═══════════════════════════════════════════════════════════════════════════════
# APPROVAL REQUESTS
# ═══════════════════════════════════════════════════════════════════════════════

class ApprovalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ApprovalHistory
        fields = "__all__"
        read_only_fields = ["date"]


class ApprovalRequestSerializer(serializers.ModelSerializer):
    history = ApprovalHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = ApprovalRequest
        fields = "__all__"
        read_only_fields = ["date"]


class ApprovalActionSerializer(serializers.Serializer):
    """Body for POST /api/approvals/{id}/action/"""
    action  = serializers.ChoiceField(choices=["Approve", "Reject", "Send Back"])
    note    = serializers.CharField(required=False, allow_blank=True)
    acted_by = serializers.CharField(required=False)


# ═══════════════════════════════════════════════════════════════════════════════
# JOB POSTINGS
# ═══════════════════════════════════════════════════════════════════════════════

class JobPostingSerializer(serializers.ModelSerializer):
    application_count = serializers.ReadOnlyField()

    class Meta:
        model  = JobPosting
        fields = "__all__"
        read_only_fields = ["posting_id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["posting_id"] = _auto_id("JP", JobPosting)
        return super().create(validated_data)


class JobPostingPublicSerializer(serializers.ModelSerializer):
    """Stripped-down serializer for the public career page."""
    class Meta:
        model  = JobPosting
        fields = [
            "id", "posting_id", "role", "department", "type", "category",
            "location", "description", "qualifications", "experience",
            "salary_range", "deadline", "expiry_date", "status",
        ]


# ═══════════════════════════════════════════════════════════════════════════════
# JOB APPLICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.SerializerMethodField(read_only=True)
    candidate_email = serializers.SerializerMethodField(read_only=True)
    candidate_phone = serializers.SerializerMethodField(read_only=True)
    posting_title   = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = JobApplication
        fields = "__all__"
        read_only_fields = ["app_id", "applied_date", "candidate", "updated_at"]

    def get_candidate_name(self, obj):
        return obj.candidate.get_full_name()

    def get_candidate_email(self, obj):
        return obj.candidate.email

    def get_candidate_phone(self, obj):
        return obj.candidate.phone

    def get_posting_title(self, obj):
        return obj.posting.role if obj.posting else obj.role

    def validate(self, attrs):
        request = self.context.get("request")
        posting = attrs.get("posting")
        if (
            request
            and posting
            and JobApplication.objects.filter(
                candidate=request.user, posting=posting
            ).exists()
        ):
            raise serializers.ValidationError(
                "You have already applied to this position."
            )
        return attrs

    def create(self, validated_data):
        validated_data["app_id"] = _auto_id("JAPP", JobApplication)
        validated_data["candidate"] = self.context["request"].user
        if validated_data.get("posting"):
            validated_data["role"] = validated_data["posting"].role
        return super().create(validated_data)


class JobApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = JobApplication
        fields = ["status", "admin_note"]


# ═══════════════════════════════════════════════════════════════════════════════
# GENERAL APPLICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class GeneralApplicationSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.SerializerMethodField(read_only=True)
    candidate_email = serializers.SerializerMethodField(read_only=True)
    candidate_phone = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = GeneralApplication
        fields = "__all__"
        read_only_fields = ["app_id", "applied_date", "candidate"]

    def get_candidate_name(self, obj):
        return obj.candidate.get_full_name()

    def get_candidate_email(self, obj):
        return obj.candidate.email

    def get_candidate_phone(self, obj):
        return obj.candidate.phone

    def create(self, validated_data):
        validated_data["app_id"] = _auto_id("GAPP", GeneralApplication)
        validated_data["candidate"] = self.context["request"].user
        return super().create(validated_data)


# ═══════════════════════════════════════════════════════════════════════════════
# PANELISTS
# ═══════════════════════════════════════════════════════════════════════════════

class PanelistSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Panelist
        fields = "__all__"
        read_only_fields = ["created_at"]

    def validate_email(self, value):
        qs = Panelist.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A panelist with this email already exists.")
        return value


# ═══════════════════════════════════════════════════════════════════════════════
# INTERVIEWS
# ═══════════════════════════════════════════════════════════════════════════════

class InterviewSerializer(serializers.ModelSerializer):
    panel_details = PanelistSerializer(source="panel", many=True, read_only=True)
    panel         = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Panelist.objects.all(), write_only=True
    )

    class Meta:
        model  = Interview
        fields = "__all__"
        read_only_fields = ["interview_id", "created_at", "updated_at"]

    def create(self, validated_data):
        panel_data = validated_data.pop("panel", [])
        validated_data["interview_id"] = _auto_id("INT", Interview)
        interview = Interview.objects.create(**validated_data)
        interview.panel.set(panel_data)
        return interview

    def update(self, instance, validated_data):
        panel_data = validated_data.pop("panel", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if panel_data is not None:
            instance.panel.set(panel_data)
        return instance


class InterviewScoreSerializer(serializers.ModelSerializer):
    """Used by panelists to submit scores/feedback."""
    class Meta:
        model  = Interview
        fields = ["score", "recommendation", "feedback", "status"]


# ═══════════════════════════════════════════════════════════════════════════════
# OFFERS
# ═══════════════════════════════════════════════════════════════════════════════

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Offer
        fields = "__all__"
        read_only_fields = ["offer_id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["offer_id"] = _auto_id("OFR", Offer)
        return super().create(validated_data)


class OfferStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Offer
        fields = ["status"]


# ═══════════════════════════════════════════════════════════════════════════════
# ONBOARDING
# ═══════════════════════════════════════════════════════════════════════════════

class OnboardingSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model  = OnboardingRecord
        fields = "__all__"
        read_only_fields = ["record_id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["record_id"] = _auto_id("ONB", OnboardingRecord)
        return super().create(validated_data)


class OnboardingTaskSerializer(serializers.ModelSerializer):
    """Partial update — just the checklist tasks."""
    class Meta:
        model  = OnboardingRecord
        fields = [
            "task_profile", "task_offer", "task_docs_upload",
            "task_docs_verify", "task_bgc", "task_checkin", "status",
        ]


# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = "__all__"
        read_only_fields = ["recipient", "created_at"]
