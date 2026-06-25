"""
recruitment/views.py
All API ViewSets + function-based auth views.
"""

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError

from .models import (
    User, CandidateProfile, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting,
    JobApplication, GeneralApplication, Panelist, Interview,
    Offer, OnboardingRecord, Notification,
)
from .serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer,
    CandidateProfileSerializer, CandidateProfileUpdateSerializer,
    ExistingRoleSerializer,
    RoleRequestSerializer, RoleRequestStatusSerializer,
    JobRequestSerializer,
    ApprovalRequestSerializer, ApprovalHistorySerializer, ApprovalActionSerializer,
    JobPostingSerializer, JobPostingPublicSerializer,
    JobApplicationSerializer, JobApplicationStatusSerializer,
    GeneralApplicationSerializer,
    PanelistSerializer,
    InterviewSerializer, InterviewScoreSerializer,
    OfferSerializer, OfferStatusSerializer,
    OnboardingSerializer, OnboardingTaskSerializer,
    NotificationSerializer,
)
from .permissions import IsHRAdmin, IsHRAdminOrReadOnly, IsOwnerOrHRAdmin, IsCandidate


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH VIEWS
# ═══════════════════════════════════════════════════════════════════════════════

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — candidate self-registration"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Registration successful.",
                "user": UserSerializer(user).data,
                "tokens": {
                    "access":  str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist refresh token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """GET/PUT /api/auth/me/ — current user profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        # Attach candidate profile if applicable
        if request.user.is_candidate:
            try:
                profile = CandidateProfileSerializer(request.user.profile).data
                data["profile"] = profile
            except CandidateProfile.DoesNotExist:
                data["profile"] = None
        return Response(data)

    def put(self, request):
        user = request.user
        # Update basic user fields
        for field in ["first_name", "last_name", "phone"]:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        # Update profile for candidates
        if user.is_candidate and "profile" in request.data:
            profile, _ = CandidateProfile.objects.get_or_create(user=user)
            ps = CandidateProfileUpdateSerializer(profile, data=request.data["profile"], partial=True)
            ps.is_valid(raise_exception=True)
            ps.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["old_password"]):
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"message": "Password changed successfully."})


# ═══════════════════════════════════════════════════════════════════════════════
# EXISTING ROLES
# ═══════════════════════════════════════════════════════════════════════════════

class ExistingRoleViewSet(viewsets.ModelViewSet):
    """
    Admin dashboard → "Existing Roles" screen.
    GET /api/roles/              — list all roles
    POST /api/roles/             — create role
    GET /api/roles/{id}/         — retrieve role
    PUT/PATCH /api/roles/{id}/   — update role
    DELETE /api/roles/{id}/      — delete role
    GET /api/roles/departments/  — list unique departments
    """
    queryset           = ExistingRole.objects.all()
    serializer_class   = ExistingRoleSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["role", "department", "role_id"]
    filterset_fields   = ["department", "status", "type"]
    ordering_fields    = ["department", "role", "headcount", "filled"]

    @action(detail=False, methods=["get"])
    def departments(self, request):
        """GET /api/roles/departments/ — unique dept list for dropdowns."""
        depts = ExistingRole.objects.values_list("department", flat=True).distinct()
        return Response(sorted(set(depts)))

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """GET /api/roles/summary/ — headcount summary per department."""
        data = (
            ExistingRole.objects
            .values("department")
            .annotate(
                total_headcount=Count("headcount"),
                total_filled=Count("filled"),
            )
        )
        return Response(list(data))


# ═══════════════════════════════════════════════════════════════════════════════
# ROLE REQUESTS
# ═══════════════════════════════════════════════════════════════════════════════

class RoleRequestViewSet(viewsets.ModelViewSet):
    """
    Admin dashboard → "Role Requests" screen.
    PATCH /api/role-requests/{id}/status/ — change status (Approve/Reject)
    """
    queryset           = RoleRequest.objects.all()
    serializer_class   = RoleRequestSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["role", "department", "request_id"]
    filterset_fields   = ["status", "department"]
    ordering_fields    = ["date", "status"]

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """PATCH /api/role-requests/{id}/update_status/"""
        instance = self.get_object()
        serializer = RoleRequestStatusSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ═══════════════════════════════════════════════════════════════════════════════
# JOB REQUESTS
# ═══════════════════════════════════════════════════════════════════════════════

class JobRequestViewSet(viewsets.ModelViewSet):
    """Admin dashboard → "Job Requests" screen."""
    queryset           = JobRequest.objects.all()
    serializer_class   = JobRequestSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["role", "request_id"]
    filterset_fields   = ["status", "type"]
    ordering_fields    = ["created_at", "status"]

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """PATCH /api/job-requests/{id}/update_status/"""
        instance = self.get_object()
        new_status = request.data.get("status")
        if new_status not in ["Pending", "Approved", "Rejected"]:
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        instance.status = new_status
        instance.save()
        return Response(JobRequestSerializer(instance).data)


# ═══════════════════════════════════════════════════════════════════════════════
# APPROVAL REQUESTS
# ═══════════════════════════════════════════════════════════════════════════════

class ApprovalRequestViewSet(viewsets.ModelViewSet):
    """
    Admin dashboard → "Approve Request" screen.
    POST /api/approvals/{id}/action/ — approve / reject / send back
    """
    queryset           = ApprovalRequest.objects.prefetch_related("history").all()
    serializer_class   = ApprovalRequestSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["request_id", "title", "submitted_by"]
    filterset_fields   = ["status", "type"]
    ordering_fields    = ["date", "status"]

    @action(detail=True, methods=["post"])
    def action(self, request, pk=None):
        """POST /api/approvals/{id}/action/ — take an approval action."""
        approval = self.get_object()
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_map = {
            "Approve":   "Approved",
            "Reject":    "Rejected",
            "Send Back": "Sent Back",
        }
        raw_action = serializer.validated_data["action"]
        new_status = action_map[raw_action]
        acted_by   = serializer.validated_data.get("acted_by") or request.user.get_full_name()
        note       = serializer.validated_data.get("note", "")

        approval.status = new_status
        approval.save()

        # Record audit trail
        ApprovalHistory.objects.create(
            approval=approval,
            action=raw_action,
            acted_by=acted_by,
            note=note,
        )

        # Cascade: if approved Job Request → update the linked JobRequest status
        if new_status == "Approved" and approval.type == "Job Request" and approval.job_request:
            approval.job_request.status = "Approved"
            approval.job_request.save()
        if new_status == "Approved" and approval.type == "Role Request" and approval.role_request:
            approval.role_request.status = "Approved"
            approval.role_request.save()

        return Response(ApprovalRequestSerializer(approval).data)


# ═══════════════════════════════════════════════════════════════════════════════
# JOB POSTINGS
# ═══════════════════════════════════════════════════════════════════════════════

class JobPostingViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD.
    Public (career page): only Published postings, read-only.
    GET /api/job-postings/public/ — no auth required, only Published
    POST /api/job-postings/{id}/publish/ — publish a posting
    POST /api/job-postings/{id}/unpublish/ — unpublish a posting
    """
    filterset_fields = ["status", "channel", "category", "department"]
    search_fields    = ["role", "department", "posting_id"]
    ordering_fields  = ["posted_date", "expiry_date", "created_at"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or user.role == "candidate":
            return JobPosting.objects.filter(status="Published")
        return JobPosting.objects.all()

    def get_serializer_class(self):
        user = self.request.user
        if not user.is_authenticated or user.role == "candidate":
            return JobPostingPublicSerializer
        return JobPostingSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "public"]:
            return [AllowAny()]
        return [IsHRAdmin()]

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def public(self, request):
        """GET /api/job-postings/public/ — career page job board."""
        qs = JobPosting.objects.filter(status="Published")
        # Optional category filter
        category = request.query_params.get("category")
        if category and category != "All Positions":
            qs = qs.filter(category=category)
        # Search
        q = request.query_params.get("q")
        if q:
            qs = qs.filter(Q(role__icontains=q) | Q(department__icontains=q))
        serializer = JobPostingPublicSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """POST /api/job-postings/{id}/publish/"""
        posting = self.get_object()
        posting.status = "Published"
        if not posting.posted_date:
            posting.posted_date = timezone.now().date()
        posting.save()
        return Response(JobPostingSerializer(posting).data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        """POST /api/job-postings/{id}/unpublish/"""
        posting = self.get_object()
        posting.status = "Unpublished"
        posting.save()
        return Response(JobPostingSerializer(posting).data)


# ═══════════════════════════════════════════════════════════════════════════════
# JOB APPLICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    Candidates: can create and view their own.
    HR Admins: can view all, update status.
    GET /api/applications/mine/  — candidate's own applications
    PATCH /api/applications/{id}/update_status/ — HR changes status
    """
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return JobApplication.objects.filter(candidate=user).select_related("posting", "candidate")
        return JobApplication.objects.all().select_related("posting", "candidate")

    def get_permissions(self):
        if self.action == "create":
            return [IsCandidate()]
        if self.action in ["update", "partial_update", "destroy", "update_status"]:
            return [IsHRAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        """GET /api/applications/mine/ — own applications for candidate dashboard."""
        apps = JobApplication.objects.filter(candidate=request.user).select_related("posting")
        serializer = JobApplicationSerializer(apps, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], permission_classes=[IsHRAdmin])
    def update_status(self, request, pk=None):
        """PATCH /api/applications/{id}/update_status/"""
        instance = self.get_object()
        serializer = JobApplicationStatusSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Create notification for the candidate
        if "status" in request.data:
            Notification.objects.create(
                recipient=instance.candidate,
                type="application_status",
                title=f"Application Update: {instance.role}",
                message=(
                    f"Your application for {instance.role} has been updated to "
                    f"'{instance.status}'."
                ),
            )
        return Response(JobApplicationSerializer(instance, context={"request": request}).data)


# ═══════════════════════════════════════════════════════════════════════════════
# GENERAL APPLICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class GeneralApplicationViewSet(viewsets.ModelViewSet):
    """
    Career Page → "Submit Profile" (general / talent-pool).
    Admin Dashboard → Applications tab (General).
    """
    serializer_class = GeneralApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return GeneralApplication.objects.filter(candidate=user)
        return GeneralApplication.objects.all().select_related("candidate")

    def get_permissions(self):
        if self.action == "create":
            return [IsCandidate()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsHRAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        apps = GeneralApplication.objects.filter(candidate=request.user)
        return Response(GeneralApplicationSerializer(apps, many=True, context={"request": request}).data)


# ═══════════════════════════════════════════════════════════════════════════════
# PANELISTS
# ═══════════════════════════════════════════════════════════════════════════════

class PanelistViewSet(viewsets.ModelViewSet):
    """Admin dashboard → "Panelist" screen."""
    queryset           = Panelist.objects.filter(is_active=True)
    serializer_class   = PanelistSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["name", "email", "department"]
    ordering_fields    = ["name"]

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


# ═══════════════════════════════════════════════════════════════════════════════
# INTERVIEWS
# ═══════════════════════════════════════════════════════════════════════════════

class InterviewViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD.
    Panelist / Candidate: read-only (their own interviews).
    POST /api/interviews/{id}/score/ — panelist submits score
    """
    serializer_class = InterviewSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return Interview.objects.filter(
                application__candidate=user
            ).prefetch_related("panel")
        return Interview.objects.all().prefetch_related("panel")

    def get_permissions(self):
        if self.action in ["list", "retrieve", "score"]:
            return [IsAuthenticated()]
        return [IsHRAdmin()]

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def score(self, request, pk=None):
        """PATCH /api/interviews/{id}/score/ — submit score and recommendation."""
        interview = self.get_object()
        serializer = InterviewScoreSerializer(interview, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Notify candidate
        if interview.application:
            Notification.objects.create(
                recipient=interview.application.candidate,
                type="interview_scheduled",
                title=f"Interview Update — {interview.role}",
                message=f"Your Round {interview.round} interview status is now '{interview.status}'.",
            )
        return Response(InterviewSerializer(interview).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def upcoming(self, request):
        """GET /api/interviews/upcoming/ — candidate's upcoming interviews."""
        today = timezone.now().date()
        if request.user.role == "candidate":
            qs = Interview.objects.filter(
                application__candidate=request.user,
                status="Scheduled",
                date__gte=today,
            ).prefetch_related("panel")
        else:
            qs = Interview.objects.filter(
                status="Scheduled", date__gte=today
            ).prefetch_related("panel")
        return Response(InterviewSerializer(qs, many=True).data)


# ═══════════════════════════════════════════════════════════════════════════════
# OFFERS
# ═══════════════════════════════════════════════════════════════════════════════

class OfferViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD.
    Candidate: can view their own offers and accept/decline.
    POST /api/offers/{id}/accept/ — candidate accepts
    POST /api/offers/{id}/decline/ — candidate declines
    """
    serializer_class = OfferSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return Offer.objects.filter(candidate=user)
        return Offer.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve", "accept", "decline"]:
            return [IsAuthenticated()]
        return [IsHRAdmin()]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        """POST /api/offers/{id}/accept/ — candidate accepts offer."""
        offer = self.get_object()
        if offer.candidate != request.user and request.user.role != "admin":
            return Response({"error": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        offer.status = "Accepted"
        offer.save()
        # Auto-create onboarding record
        if not hasattr(offer, "onboarding"):
            from .serializers import _auto_id
            OnboardingRecord.objects.create(
                record_id=_auto_id("ONB", OnboardingRecord),
                employee_name=offer.candidate_name,
                role=offer.role,
                joining_date=offer.joining_date,
                offer=offer,
                candidate=offer.candidate,
            )
        Notification.objects.create(
            recipient=offer.candidate,
            type="offer_accepted",
            title="Offer Accepted",
            message=f"You have accepted the offer for {offer.role}. Onboarding has been initiated.",
        )
        return Response(OfferSerializer(offer).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def decline(self, request, pk=None):
        """POST /api/offers/{id}/decline/ — candidate declines offer."""
        offer = self.get_object()
        if offer.candidate != request.user and request.user.role != "admin":
            return Response({"error": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        offer.status = "Rejected"
        offer.save()
        return Response(OfferSerializer(offer).data)


# ═══════════════════════════════════════════════════════════════════════════════
# ONBOARDING
# ═══════════════════════════════════════════════════════════════════════════════

class OnboardingViewSet(viewsets.ModelViewSet):
    """
    Admin dashboard → "Onboarding" screen.
    PATCH /api/onboarding/{id}/tasks/ — update checklist
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "candidate":
            return OnboardingRecord.objects.filter(candidate=self.request.user)
        return OnboardingRecord.objects.all()

    def get_serializer_class(self):
        if self.action == "tasks":
            return OnboardingTaskSerializer
        return OnboardingSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsHRAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["patch"], permission_classes=[IsHRAdmin])
    def tasks(self, request, pk=None):
        """PATCH /api/onboarding/{id}/tasks/ — update task checklist."""
        record = self.get_object()
        serializer = OnboardingTaskSerializer(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Auto-complete if all tasks done
        record.refresh_from_db()
        if record.completion_percentage == 100:
            record.status = "Completed"
            record.save()
        return Response(OnboardingSerializer(record).data)


# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/notifications/ — candidate's notifications."""
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=["patch"])
    def mark_read(self, request, pk=None):
        """PATCH /api/notifications/{id}/mark_read/"""
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=["patch"])
    def mark_all_read(self, request):
        """PATCH /api/notifications/mark_all_read/"""
        self.get_queryset().update(is_read=True)
        return Response({"message": "All notifications marked as read."})


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD STATS
# ═══════════════════════════════════════════════════════════════════════════════

class DashboardStatsView(APIView):
    """GET /api/dashboard/stats/ — aggregate KPIs for the HR admin dashboard."""
    permission_classes = [IsHRAdmin]

    def get(self, request):
        today = timezone.now().date()
        data = {
            # KPI cards
            "open_positions":        JobPosting.objects.filter(status="Published").count(),
            "pending_approvals":     ApprovalRequest.objects.filter(status="Pending").count(),
            "total_applicants":      JobApplication.objects.count() + GeneralApplication.objects.count(),
            "interviews_scheduled":  Interview.objects.filter(status="Scheduled", date__gte=today).count(),
            "offers_released":       Offer.objects.filter(status__in=["Sent", "Accepted"]).count(),
            "new_joiners":           OnboardingRecord.objects.filter(
                                         status="Completed",
                                         joining_date__month=today.month,
                                         joining_date__year=today.year,
                                     ).count(),
            # Analytics
            "offer_acceptance_rate": _compute_offer_rate(),
            "total_roles":           ExistingRole.objects.count(),
            "active_roles":          ExistingRole.objects.filter(status="Active").count(),
            # Pipeline
            "pipeline": {
                "applied":     JobApplication.objects.filter(status="Applied").count(),
                "shortlisted": JobApplication.objects.filter(status="Shortlisted").count(),
                "selected":    JobApplication.objects.filter(status="Selected").count(),
                "offered":     Offer.objects.count(),
            },
        }
        return Response(data)


def _compute_offer_rate():
    total    = Offer.objects.filter(status__in=["Accepted", "Rejected"]).count()
    accepted = Offer.objects.filter(status="Accepted").count()
    if total == 0:
        return "N/A"
    return f"{round(accepted / total * 100, 1)}%"
