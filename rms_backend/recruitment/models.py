"""
recruitment/models.py
All database models for South Point School — Recruitment Management System
"""

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import FileExtensionValidator


# ═══════════════════════════════════════════════════════════════════════════════
# 1. USER MODEL
# ═══════════════════════════════════════════════════════════════════════════════

class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Extends Django's built-in User.
    - EMAIL is the login field (no username required from users)
    - username is auto-populated from email internally
    role='admin'     → HR staff who use the admin dashboard
    role='candidate' → Job seekers who use the career page
    """
    ROLE_CHOICES = [
        ("admin",     "HR Admin"),
        ("candidate", "Candidate"),
    ]
    # Override email to be unique and required
    email    = models.EmailField(unique=True)
    role     = models.CharField(max_length=20, choices=ROLE_CHOICES, default="candidate")
    phone    = models.CharField(max_length=20, blank=True)

    # Use email as the login credential instead of username
    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]   # asked by createsuperuser

    objects = UserManager()

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def save(self, *args, **kwargs):
        # Keep username in sync with email (Django still needs the field)
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}> ({self.role})"

    @property
    def is_hr_admin(self):
        return self.role == "admin"

    @property
    def is_candidate(self):
        return self.role == "candidate"


# ═══════════════════════════════════════════════════════════════════════════════
# 2. CANDIDATE PROFILE
# ═══════════════════════════════════════════════════════════════════════════════

class CandidateProfile(models.Model):
    """
    Extended profile for candidates — linked 1-to-1 to User.
    Mirrors the multi-step Apply form on the career page.
    """
    EXPERIENCE_CHOICES = [
        ("0-1",  "0–1 years"),
        ("1-2",  "1–2 years"),
        ("2-4",  "2–4 years"),
        ("3-5",  "3–5 years"),
        ("5-8",  "5–8 years"),
        ("8+",   "8+ years"),
    ]

    user              = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    current_location  = models.CharField(max_length=200, blank=True)
    # Education
    educational_qualification = models.CharField(max_length=200, blank=True)
    degree_name               = models.CharField(max_length=200, blank=True)
    professional_qualification = models.CharField(max_length=200, blank=True)
    professional_degree_name   = models.CharField(max_length=200, blank=True)
    extracurricular_qualification = models.CharField(max_length=200, blank=True)
    extracurricular_degree_name   = models.CharField(max_length=200, blank=True)
    # Professional
    years_of_experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, blank=True)
    preferred_role      = models.CharField(max_length=200, blank=True)
    preferred_dept      = models.CharField(max_length=200, blank=True)
    roles_interested    = models.JSONField(default=list, blank=True)   # ["Math Teacher", ...]
    skills              = models.JSONField(default=list, blank=True)   # ["Python", ...]
    salary_expectation  = models.CharField(max_length=100, blank=True)
    # Links
    linkedin_profile    = models.URLField(blank=True)
    portfolio_link      = models.URLField(blank=True)
    # Resume
    resume = models.FileField(
        upload_to="resumes/%Y/%m/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf", "doc", "docx"])],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "candidate_profiles"

    def __str__(self):
        return f"Profile: {self.user.get_full_name()}"


# ═══════════════════════════════════════════════════════════════════════════════
# 3. EXISTING ROLES  (HR Admin Dashboard → "Existing Roles" screen)
# ═══════════════════════════════════════════════════════════════════════════════

class ExistingRole(models.Model):
    STATUS_CHOICES = [
        ("Active",   "Active"),
        ("Inactive", "Inactive"),
    ]
    TYPE_CHOICES = [
        ("Full-time",  "Full-time"),
        ("Part-time",  "Part-time"),
        ("Contract",   "Contract"),
        ("Internship", "Internship"),
    ]
    DEPT_CHOICES = [
        ("Science",        "Science"),
        ("Commerce",       "Commerce"),
        ("Arts",           "Arts"),
        ("Administration", "Administration"),
        ("Sports",         "Sports"),
        ("Languages",      "Languages"),
        ("Student Welfare","Student Welfare"),
    ]

    role_id      = models.CharField(max_length=30, unique=True)  # e.g. ROL-001
    department   = models.CharField(max_length=100, choices=DEPT_CHOICES)
    role         = models.CharField(max_length=200)
    type         = models.CharField(max_length=50, choices=TYPE_CHOICES, default="Full-time")
    headcount    = models.PositiveIntegerField(default=1)
    filled       = models.PositiveIntegerField(default=0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    experience   = models.CharField(max_length=50, blank=True)   # e.g. "3-5"
    salary_range = models.CharField(max_length=100, blank=True)  # e.g. "40,000-60,000"
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "existing_roles"
        ordering = ["department", "role"]

    def __str__(self):
        return f"{self.role_id} — {self.role} ({self.department})"

    @property
    def vacancies(self):
        return max(0, self.headcount - self.filled)


# ═══════════════════════════════════════════════════════════════════════════════
# 4. ROLE REQUESTS  (Admin Dashboard → "Role Requests" screen)
# ═══════════════════════════════════════════════════════════════════════════════

class RoleRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending",  "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    request_id    = models.CharField(max_length=30, unique=True)  # e.g. RR-2026-0001
    department    = models.CharField(max_length=100)
    role          = models.CharField(max_length=200)
    justification = models.TextField()
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    submitted_by  = models.CharField(max_length=200, blank=True)
    date          = models.DateField(auto_now_add=True)
    reviewed_at   = models.DateTimeField(null=True, blank=True)
    reviewer_note = models.TextField(blank=True)
    experience    = models.CharField(max_length=50, blank=True)
    salary_range  = models.CharField(max_length=100, blank=True)
    created_by    = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="role_requests_created"
    )

    class Meta:
        db_table = "role_requests"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.request_id} — {self.role} ({self.status})"


# ═══════════════════════════════════════════════════════════════════════════════
# 5. JOB REQUESTS  (Admin Dashboard → "Job Requests" screen)
# ═══════════════════════════════════════════════════════════════════════════════

class JobRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending",  "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    request_id    = models.CharField(max_length=30, unique=True)  # e.g. JR-2026-0001
    role          = models.CharField(max_length=200)
    vacancies     = models.PositiveIntegerField(default=1)
    experience    = models.CharField(max_length=50, blank=True)   # e.g. "3–5 yrs"
    salary_range  = models.CharField(max_length=100, blank=True)  # e.g. "₹40K–₹60K"
    type          = models.CharField(max_length=50, default="Full-time")
    qualification = models.CharField(max_length=200, blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    submitted_by  = models.CharField(max_length=200, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)
    created_by    = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="job_requests_created"
    )

    class Meta:
        db_table = "job_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.request_id} — {self.role} ({self.status})"


# ═══════════════════════════════════════════════════════════════════════════════
# 6. APPROVAL REQUESTS  (Admin Dashboard → "Approve Request" screen)
# ═══════════════════════════════════════════════════════════════════════════════

class ApprovalRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending",   "Pending"),
        ("Approved",  "Approved"),
        ("Rejected",  "Rejected"),
        ("Sent Back", "Sent Back"),
    ]
    TYPE_CHOICES = [
        ("Job Request",  "Job Request"),
        ("Role Request", "Role Request"),
    ]

    request_id   = models.CharField(max_length=30)   # links to JR-xxx or RR-xxx
    type         = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title        = models.CharField(max_length=200)
    department   = models.CharField(max_length=100, blank=True)
    submitted_by = models.CharField(max_length=200, blank=True)
    date         = models.DateField(auto_now_add=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    # FK links (optional, for easy cross-referencing)
    job_request  = models.ForeignKey(
        JobRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="approvals"
    )
    role_request = models.ForeignKey(
        RoleRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="approvals"
    )

    class Meta:
        db_table = "approval_requests"
        ordering = ["-date"]

    def __str__(self):
        return f"Approval({self.request_id}) — {self.status}"


class ApprovalHistory(models.Model):
    """Audit trail for every action taken on an ApprovalRequest."""
    approval = models.ForeignKey(
        ApprovalRequest, on_delete=models.CASCADE, related_name="history"
    )
    action   = models.CharField(max_length=50)    # "Submitted", "Approved", "Sent Back"
    acted_by = models.CharField(max_length=200)
    date     = models.DateField(auto_now_add=True)
    note     = models.TextField(blank=True)

    class Meta:
        db_table = "approval_history"
        ordering = ["date"]

    def __str__(self):
        return f"{self.approval.request_id} — {self.action} by {self.acted_by}"


# ═══════════════════════════════════════════════════════════════════════════════
# 7. JOB POSTINGS  (Admin Dashboard → "Job Postings" + Career Page public board)
# ═══════════════════════════════════════════════════════════════════════════════

class JobPosting(models.Model):
    STATUS_CHOICES = [
        ("Published",   "Published"),
        ("Unpublished", "Unpublished"),
        ("Closed",      "Closed"),
    ]
    CHANNEL_CHOICES = [
        ("External", "External"),
        ("Internal", "Internal"),
    ]
    CATEGORY_CHOICES = [
        ("Academic Positions",            "Academic Positions"),
        ("Administrative Positions",      "Administrative Positions"),
        ("Operations & Support Positions","Operations & Support Positions"),
    ]

    posting_id     = models.CharField(max_length=30, unique=True)  # e.g. JP-2026-0001
    role           = models.CharField(max_length=200)
    department     = models.CharField(max_length=100, blank=True)
    type           = models.CharField(max_length=50, default="Full-time")
    category       = models.CharField(max_length=100, choices=CATEGORY_CHOICES, blank=True)
    location       = models.CharField(max_length=200, default="Guwahati, Assam")
    description    = models.TextField(blank=True)
    qualifications = models.JSONField(default=list)   # ["M.Sc + B.Ed", ...]
    experience     = models.CharField(max_length=50, blank=True)
    salary_range   = models.CharField(max_length=100, blank=True)
    qualification  = models.CharField(max_length=200, blank=True)
    channel        = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default="External")
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Unpublished")
    posted_date    = models.DateField(null=True, blank=True)
    expiry_date    = models.DateField(null=True, blank=True)
    deadline       = models.CharField(max_length=100, blank=True)  # e.g. "July 15, 2026"
    # Cross-references to originating request
    job_request    = models.ForeignKey(
        JobRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="postings"
    )
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_postings"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.posting_id} — {self.role} [{self.status}]"

    @property
    def application_count(self):
        return self.job_applications.count()


# ═══════════════════════════════════════════════════════════════════════════════
# 8. JOB APPLICATIONS  (Admin Dashboard → "Applications" tab: Job)
#                      (Career Page → "Apply Now" per posting)
# ═══════════════════════════════════════════════════════════════════════════════

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied",      "Applied"),
        ("Shortlisted",  "Shortlisted"),
        ("Selected",     "Selected"),
        ("Rejected",     "Rejected"),
        ("Offer Sent",   "Offer Sent"),
        ("Offer Accepted","Offer Accepted"),
        ("Withdrawn",    "Withdrawn"),
    ]

    app_id          = models.CharField(max_length=30, unique=True)  # e.g. JAPP-2026-0001
    candidate       = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="job_applications"
    )
    posting         = models.ForeignKey(
        JobPosting, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="job_applications"
    )
    role            = models.CharField(max_length=200)
    experience      = models.CharField(max_length=50, blank=True)
    qualification   = models.CharField(max_length=200, blank=True)
    cover_letter    = models.TextField(blank=True)
    notice_period   = models.CharField(max_length=50, blank=True)
    has_referral    = models.BooleanField(default=False)
    referral_emp_id = models.CharField(max_length=50, blank=True)
    referred_by     = models.CharField(max_length=200, blank=True)
    applied_date    = models.DateField(auto_now_add=True)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    admin_note      = models.TextField(blank=True)  # internal note from HR
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_applications"
        ordering = ["-applied_date"]
        unique_together = [["candidate", "posting"]]   # one application per posting per user

    def __str__(self):
        return f"{self.app_id} — {self.candidate.get_full_name()} → {self.role}"


# ═══════════════════════════════════════════════════════════════════════════════
# 9. GENERAL APPLICATIONS  (Career Page → "Submit Profile" / talent pool)
#                           (Admin Dashboard → "Applications" tab: General)
# ═══════════════════════════════════════════════════════════════════════════════

class GeneralApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied",     "Applied"),
        ("Shortlisted", "Shortlisted"),
        ("Rejected",    "Rejected"),
    ]

    app_id         = models.CharField(max_length=30, unique=True)  # e.g. GAPP-2026-0001
    candidate      = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="general_applications"
    )
    preferred_role = models.CharField(max_length=200, blank=True)
    preferred_dept = models.CharField(max_length=200, blank=True)
    experience     = models.CharField(max_length=50, blank=True)
    qualification  = models.CharField(max_length=200, blank=True)
    applied_date   = models.DateField(auto_now_add=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    admin_note     = models.TextField(blank=True)

    class Meta:
        db_table = "general_applications"
        ordering = ["-applied_date"]

    def __str__(self):
        return f"{self.app_id} — {self.candidate.get_full_name()} (General)"


# ═══════════════════════════════════════════════════════════════════════════════
# 10. PANELISTS  (Admin Dashboard → "Panelist" screen)
# ═══════════════════════════════════════════════════════════════════════════════

class Panelist(models.Model):
    name       = models.CharField(max_length=200)
    email      = models.EmailField(unique=True)
    phone      = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "panelists"
        ordering = ["name"]

    def __str__(self):
        return self.name


# ═══════════════════════════════════════════════════════════════════════════════
# 11. INTERVIEWS  (Admin Dashboard → "Interview Panel" screen)
#                 (Career Page → Candidate Dashboard → "Upcoming Interviews")
# ═══════════════════════════════════════════════════════════════════════════════

class Interview(models.Model):
    STATUS_CHOICES = [
        ("Scheduled",  "Scheduled"),
        ("Completed",  "Completed"),
        ("Cancelled",  "Cancelled"),
        ("Rescheduled","Rescheduled"),
    ]
    MODE_CHOICES = [
        ("Online",  "Online"),
        ("Offline", "Offline"),
    ]
    RECOMMENDATION_CHOICES = [
        ("Selected",  "Selected"),
        ("Rejected",  "Rejected"),
        ("On Hold",   "On Hold"),
        ("Next Round","Next Round"),
    ]

    interview_id   = models.CharField(max_length=30, unique=True)  # e.g. INT-2026-0001
    application    = models.ForeignKey(
        JobApplication, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="interviews"
    )
    candidate_name = models.CharField(max_length=200)
    role           = models.CharField(max_length=200)
    date           = models.DateField()
    time           = models.TimeField()
    panel          = models.ManyToManyField(Panelist, blank=True, related_name="interviews")
    score          = models.PositiveIntegerField(null=True, blank=True)  # 0-100
    recommendation = models.CharField(
        max_length=20, choices=RECOMMENDATION_CHOICES, blank=True
    )
    feedback       = models.TextField(blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Scheduled")
    mode           = models.CharField(max_length=20, choices=MODE_CHOICES, default="Online")
    meeting_link   = models.URLField(blank=True)
    round          = models.PositiveIntegerField(default=1)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "interviews"
        ordering = ["-date", "-time"]

    def __str__(self):
        return f"{self.interview_id} — {self.candidate_name} (Round {self.round})"


# ═══════════════════════════════════════════════════════════════════════════════
# 12. OFFERS  (Admin Dashboard → "Offer Management" screen)
#             (Career Page → Candidate Dashboard → "Onboarding")
# ═══════════════════════════════════════════════════════════════════════════════

class Offer(models.Model):
    STATUS_CHOICES = [
        ("Draft",    "Draft"),
        ("Sent",     "Sent"),
        ("Accepted", "Accepted"),
        ("Rejected", "Rejected"),
        ("Expired",  "Expired"),
    ]

    offer_id       = models.CharField(max_length=30, unique=True)  # e.g. OFR-2026-0001
    candidate      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="offers"
    )
    candidate_name = models.CharField(max_length=200)
    role           = models.CharField(max_length=200)
    ctc            = models.CharField(max_length=100, blank=True)   # e.g. "₹52,000/mo"
    issued_date    = models.DateField(null=True, blank=True)
    expiry_date    = models.DateField(null=True, blank=True)
    joining_date   = models.DateField(null=True, blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Draft")
    offer_letter   = models.FileField(upload_to="offer_letters/%Y/", blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "offers"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.offer_id} — {self.candidate_name} [{self.status}]"


# ═══════════════════════════════════════════════════════════════════════════════
# 13. ONBOARDING  (Admin Dashboard → "Onboarding" screen)
# ═══════════════════════════════════════════════════════════════════════════════

class OnboardingRecord(models.Model):
    STATUS_CHOICES = [
        ("Documents Pending", "Documents Pending"),
        ("In Progress",       "In Progress"),
        ("Completed",         "Completed"),
    ]

    record_id     = models.CharField(max_length=30, unique=True)  # e.g. ONB-2026-0001
    employee_name = models.CharField(max_length=200)
    role          = models.CharField(max_length=200)
    joining_date  = models.DateField(null=True, blank=True)
    employee_id   = models.CharField(max_length=50, blank=True)  # EMP-2026-042
    status        = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default="Documents Pending"
    )
    offer = models.OneToOneField(
        Offer, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="onboarding"
    )
    candidate = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="onboarding_records"
    )
    # Checklist tasks (boolean flags)
    task_profile     = models.BooleanField(default=False, verbose_name="Profile Completed")
    task_offer       = models.BooleanField(default=False, verbose_name="Offer Accepted")
    task_docs_upload = models.BooleanField(default=False, verbose_name="Documents Uploaded")
    task_docs_verify = models.BooleanField(default=False, verbose_name="Documents Verified")
    task_bgc         = models.BooleanField(default=False, verbose_name="Background Check")
    task_checkin     = models.BooleanField(default=False, verbose_name="Day-1 Check-in")
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "onboarding_records"
        ordering = ["joining_date"]

    def __str__(self):
        return f"{self.record_id} — {self.employee_name} [{self.status}]"

    @property
    def completion_percentage(self):
        tasks = [
            self.task_profile, self.task_offer, self.task_docs_upload,
            self.task_docs_verify, self.task_bgc, self.task_checkin,
        ]
        return round(sum(tasks) / len(tasks) * 100)


# ═══════════════════════════════════════════════════════════════════════════════
# 14. NOTIFICATION  (Career Page → Candidate Dashboard → "Notifications")
# ═══════════════════════════════════════════════════════════════════════════════

class Notification(models.Model):
    TYPE_CHOICES = [
        ("application_status", "Application Status Change"),
        ("interview_scheduled","Interview Scheduled"),
        ("offer_received",     "Offer Received"),
        ("offer_accepted",     "Offer Accepted"),
        ("onboarding",         "Onboarding Update"),
        ("general",            "General"),
    ]

    recipient   = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type        = models.CharField(max_length=30, choices=TYPE_CHOICES, default="general")
    title       = models.CharField(max_length=200)
    message     = models.TextField()
    is_read     = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notif → {self.recipient.email}: {self.title}"
