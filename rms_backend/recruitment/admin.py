"""
recruitment/admin.py
Register all models with Django admin for easy data management.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, CandidateProfile, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting,
    JobApplication, GeneralApplication, Panelist, Interview,
    Offer, OnboardingRecord, Notification,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ["email", "first_name", "last_name", "role", "is_active", "date_joined"]
    list_filter   = ["role", "is_active", "is_staff"]
    search_fields = ["email", "first_name", "last_name"]
    ordering      = ["-date_joined"]
    fieldsets     = BaseUserAdmin.fieldsets + (
        ("RMS Role", {"fields": ("role", "phone")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("email", "first_name", "last_name", "password1", "password2", "role", "phone"),
        }),
    )


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display  = ["user", "preferred_role", "preferred_dept", "years_of_experience"]
    search_fields = ["user__email", "user__first_name", "preferred_role"]
    raw_id_fields = ["user"]


@admin.register(ExistingRole)
class ExistingRoleAdmin(admin.ModelAdmin):
    list_display  = ["role_id", "role", "department", "type", "headcount", "filled", "status"]
    list_filter   = ["department", "status", "type"]
    search_fields = ["role", "department", "role_id"]
    ordering      = ["department", "role"]


@admin.register(RoleRequest)
class RoleRequestAdmin(admin.ModelAdmin):
    list_display  = ["request_id", "role", "department", "status", "date"]
    list_filter   = ["status", "department"]
    search_fields = ["request_id", "role"]


@admin.register(JobRequest)
class JobRequestAdmin(admin.ModelAdmin):
    list_display  = ["request_id", "role", "vacancies", "type", "status", "created_at"]
    list_filter   = ["status", "type"]
    search_fields = ["request_id", "role"]


class ApprovalHistoryInline(admin.TabularInline):
    model  = ApprovalHistory
    extra  = 0
    readonly_fields = ["date"]


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display  = ["request_id", "type", "title", "submitted_by", "status", "date"]
    list_filter   = ["status", "type"]
    search_fields = ["request_id", "title", "submitted_by"]
    inlines       = [ApprovalHistoryInline]


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display  = ["posting_id", "role", "department", "channel", "status", "posted_date", "expiry_date"]
    list_filter   = ["status", "channel", "category"]
    search_fields = ["posting_id", "role", "department"]
    ordering      = ["-created_at"]


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display  = ["app_id", "candidate", "role", "posting", "applied_date", "status"]
    list_filter   = ["status"]
    search_fields = ["app_id", "candidate__email", "role"]
    raw_id_fields = ["candidate", "posting"]
    ordering      = ["-applied_date"]


@admin.register(GeneralApplication)
class GeneralApplicationAdmin(admin.ModelAdmin):
    list_display  = ["app_id", "candidate", "preferred_role", "preferred_dept", "status", "applied_date"]
    list_filter   = ["status"]
    search_fields = ["app_id", "candidate__email", "preferred_role"]
    raw_id_fields = ["candidate"]


@admin.register(Panelist)
class PanelistAdmin(admin.ModelAdmin):
    list_display  = ["name", "email", "phone", "department", "is_active"]
    list_filter   = ["is_active", "department"]
    search_fields = ["name", "email"]


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display  = ["interview_id", "candidate_name", "role", "date", "time", "mode", "status", "score"]
    list_filter   = ["status", "mode", "round"]
    search_fields = ["interview_id", "candidate_name", "role"]
    filter_horizontal = ["panel"]
    ordering      = ["-date"]


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display  = ["offer_id", "candidate_name", "role", "ctc", "issued_date", "expiry_date", "status"]
    list_filter   = ["status"]
    search_fields = ["offer_id", "candidate_name", "role"]
    raw_id_fields = ["candidate"]


@admin.register(OnboardingRecord)
class OnboardingRecordAdmin(admin.ModelAdmin):
    list_display  = [
        "record_id", "employee_name", "role", "joining_date",
        "employee_id", "status", "completion_percentage"
    ]
    list_filter   = ["status"]
    search_fields = ["record_id", "employee_name"]
    readonly_fields = ["completion_percentage"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ["recipient", "type", "title", "is_read", "created_at"]
    list_filter   = ["type", "is_read"]
    search_fields = ["recipient__email", "title"]
