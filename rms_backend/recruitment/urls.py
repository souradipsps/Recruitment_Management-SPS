"""
recruitment/urls.py
All API URL patterns — mounted under /api/ in rms_backend/urls.py
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r"roles",                views.ExistingRoleViewSet,       basename="roles")
router.register(r"role-requests",        views.RoleRequestViewSet,        basename="role-requests")
router.register(r"job-requests",         views.JobRequestViewSet,         basename="job-requests")
router.register(r"approvals",            views.ApprovalRequestViewSet,    basename="approvals")
router.register(r"job-postings",         views.JobPostingViewSet,         basename="job-postings")
router.register(r"applications",         views.JobApplicationViewSet,     basename="applications")
router.register(r"general-applications", views.GeneralApplicationViewSet, basename="general-applications")
router.register(r"panelists",            views.PanelistViewSet,           basename="panelists")
router.register(r"interviews",           views.InterviewViewSet,          basename="interviews")
router.register(r"offers",               views.OfferViewSet,              basename="offers")
router.register(r"onboarding",           views.OnboardingViewSet,         basename="onboarding")
router.register(r"notifications",        views.NotificationViewSet,       basename="notifications")

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path("auth/register/",        views.RegisterView.as_view(),       name="auth-register"),
    path("auth/login/",           TokenObtainPairView.as_view(),      name="auth-login"),
    path("auth/token/refresh/",   TokenRefreshView.as_view(),         name="auth-token-refresh"),
    path("auth/logout/",          views.LogoutView.as_view(),         name="auth-logout"),
    path("auth/me/",              views.MeView.as_view(),             name="auth-me"),
    path("auth/change-password/", views.ChangePasswordView.as_view(), name="auth-change-password"),

    # ── Dashboard Stats ───────────────────────────────────────────────────────
    path("dashboard/stats/",      views.DashboardStatsView.as_view(), name="dashboard-stats"),

    # ── All ViewSet routes ────────────────────────────────────────────────────
    path("", include(router.urls)),
]
