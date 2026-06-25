# Django + PostgreSQL API Guide
## For: South Point School — Career Page & Admin Dashboard (RMS)

---

## 🗺️ Overview

Both frontend apps belong to a **Recruitment Management System (RMS)** for South Point School:

| App | Purpose |
|---|---|
| **career-page** | Public-facing job board; candidates sign up, browse open positions, submit applications |
| **admin_dashboard** | Internal HR portal; HR manages roles, requests, approvals, interviews, offers & onboarding |

Both apps currently use **localStorage** (mock data). The goal is to replace that with a real **Django REST Framework + PostgreSQL** backend.

---

## 🧠 Step 1 — Understand the Data Model

From reading both codebases, here are all the entities:

### Entities & Relationships

```
School
  └── Department (Science, Commerce, Arts, Administration, Sports, Languages)
       └── ExistingRole (headcount, filled, status, salary range, experience)
            └── RoleRequest (HR requests a new role vacancy)
                 └── ApprovalRequest (Principal/management approves or rejects)
                      └── JobRequest (HR drafts a job opening)
                           └── JobPosting (published on career page)
                                └── JobApplication (candidate applies to a posting)
                                     └── Interview (scheduled, panel assigned, scored)
                                          └── Offer (CTC, issued date, expiry)
                                               └── Onboarding (documents, tasks checklist)

Candidate (from career-page: name, email, phone, resume, profile)
GeneralApplication (candidate applies without a specific posting)
Panelist (interview panel members)
```

---

## 🛠️ Step 2 — Set Up the Django Project

### 2.1 Install prerequisites (run in your terminal)

```bash
pip install django djangorestframework psycopg2-binary django-cors-headers pillow djangorestframework-simplejwt python-decouple
```

### 2.2 Create the project

```bash
django-admin startproject rms_backend
cd rms_backend
python manage.py startapp recruitment
```

### 2.3 Project structure to target

```
rms_backend/
├── rms_backend/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── recruitment/
    ├── models.py        ← All database models
    ├── serializers.py   ← DRF serializers
    ├── views.py         ← API logic (ViewSets)
    ├── urls.py          ← URL routing
    ├── admin.py         ← Django admin registration
    └── permissions.py   ← Custom permissions (admin vs candidate)
```

---

## 🗄️ Step 3 — Define the PostgreSQL Database

### 3.1 `settings.py` — Database & App config

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'rms_db',
        'USER': 'rms_user',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'recruitment',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be FIRST
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",   # admin_dashboard (Vite dev server)
    "http://localhost:5174",   # career-page (Vite dev server)
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

---

## 📐 Step 4 — Build the Models (`recruitment/models.py`)

Map every localStorage entity from `data.ts` to a Django model:

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

# ── User / Candidate ────────────────────────────────────────────────
class User(AbstractUser):
    """Extends Django's user. Used for both HR admins and candidates."""
    ROLE_CHOICES = [('admin', 'HR Admin'), ('candidate', 'Candidate')]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    phone = models.CharField(max_length=20, blank=True)

class CandidateProfile(models.Model):
    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_role   = models.CharField(max_length=200, blank=True)
    preferred_dept   = models.CharField(max_length=200, blank=True)
    experience       = models.CharField(max_length=50, blank=True)
    qualification    = models.CharField(max_length=200, blank=True)
    resume           = models.FileField(upload_to='resumes/', blank=True, null=True)
    created_at       = models.DateTimeField(auto_now_add=True)

# ── HR Core ─────────────────────────────────────────────────────────
class ExistingRole(models.Model):
    STATUS_CHOICES = [('Active', 'Active'), ('Inactive', 'Inactive')]
    role_id     = models.CharField(max_length=20, unique=True)   # e.g. ROL-001
    department  = models.CharField(max_length=100)
    role        = models.CharField(max_length=200)
    type        = models.CharField(max_length=50)                # Full-time / Part-time
    headcount   = models.PositiveIntegerField(default=1)
    filled      = models.PositiveIntegerField(default=0)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    experience  = models.CharField(max_length=50, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

class RoleRequest(models.Model):
    STATUS_CHOICES = [('Pending','Pending'),('Approved','Approved'),('Rejected','Rejected')]
    request_id  = models.CharField(max_length=30, unique=True)   # e.g. RR-2026-0001
    department  = models.CharField(max_length=100)
    role        = models.CharField(max_length=200)
    justification = models.TextField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    date        = models.DateField(auto_now_add=True)
    created_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class JobRequest(models.Model):
    STATUS_CHOICES = [('Pending','Pending'),('Approved','Approved'),('Rejected','Rejected')]
    request_id  = models.CharField(max_length=30, unique=True)
    role        = models.CharField(max_length=200)
    vacancies   = models.PositiveIntegerField(default=1)
    experience  = models.CharField(max_length=50)
    salary_range = models.CharField(max_length=100)
    type        = models.CharField(max_length=50)
    qualification = models.CharField(max_length=200)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at  = models.DateTimeField(auto_now_add=True)

class ApprovalRequest(models.Model):
    STATUS_CHOICES = [('Pending','Pending'),('Approved','Approved'),('Rejected','Rejected'),('Sent Back','Sent Back')]
    TYPE_CHOICES   = [('Job Request','Job Request'),('Role Request','Role Request')]
    request_id  = models.CharField(max_length=30)
    type        = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title       = models.CharField(max_length=200)
    department  = models.CharField(max_length=100)
    submitted_by = models.CharField(max_length=200)
    date        = models.DateField(auto_now_add=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

class ApprovalHistory(models.Model):
    approval    = models.ForeignKey(ApprovalRequest, on_delete=models.CASCADE, related_name='history')
    action      = models.CharField(max_length=50)
    acted_by    = models.CharField(max_length=200)
    date        = models.DateField(auto_now_add=True)
    note        = models.TextField(blank=True)

# ── Job Postings ─────────────────────────────────────────────────────
class JobPosting(models.Model):
    STATUS_CHOICES = [('Published','Published'),('Unpublished','Unpublished'),('Closed','Closed')]
    CHANNEL_CHOICES = [('External','External'),('Internal','Internal')]
    posting_id  = models.CharField(max_length=30, unique=True)
    role        = models.CharField(max_length=200)
    department  = models.CharField(max_length=100, blank=True)
    type        = models.CharField(max_length=50, blank=True)
    category    = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    qualifications = models.JSONField(default=list)
    location    = models.CharField(max_length=200, blank=True)
    channel     = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='External')
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Unpublished')
    posted_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    job_request = models.ForeignKey(JobRequest, on_delete=models.SET_NULL, null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

# ── Applications ──────────────────────────────────────────────────────
class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('Applied','Applied'),('Shortlisted','Shortlisted'),
        ('Selected','Selected'),('Rejected','Rejected'),('Offer Sent','Offer Sent'),
    ]
    app_id      = models.CharField(max_length=30, unique=True)
    candidate   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    posting     = models.ForeignKey(JobPosting, on_delete=models.SET_NULL, null=True, blank=True)
    role        = models.CharField(max_length=200)
    experience  = models.CharField(max_length=50, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    cover_letter = models.TextField(blank=True)
    notice_period = models.CharField(max_length=50, blank=True)
    referral_emp_id = models.CharField(max_length=50, blank=True)
    applied_date = models.DateField(auto_now_add=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    referred_by = models.CharField(max_length=200, blank=True)

class GeneralApplication(models.Model):
    STATUS_CHOICES = [('Applied','Applied'),('Shortlisted','Shortlisted'),('Rejected','Rejected')]
    app_id      = models.CharField(max_length=30, unique=True)
    candidate   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='general_applications')
    preferred_role = models.CharField(max_length=200)
    preferred_dept = models.CharField(max_length=100)
    experience  = models.CharField(max_length=50, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    applied_date = models.DateField(auto_now_add=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')

# ── Interviews ────────────────────────────────────────────────────────
class Panelist(models.Model):
    name  = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)

class Interview(models.Model):
    STATUS_CHOICES = [('Scheduled','Scheduled'),('Completed','Completed'),('Cancelled','Cancelled')]
    MODE_CHOICES   = [('Online','Online'),('Offline','Offline')]
    interview_id  = models.CharField(max_length=30, unique=True)
    application   = models.ForeignKey(JobApplication, on_delete=models.SET_NULL, null=True, blank=True)
    candidate_name = models.CharField(max_length=200)
    role          = models.CharField(max_length=200)
    date          = models.DateField()
    time          = models.TimeField()
    panel         = models.ManyToManyField(Panelist, blank=True)
    score         = models.PositiveIntegerField(null=True, blank=True)
    recommendation = models.CharField(max_length=100, blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    mode          = models.CharField(max_length=20, choices=MODE_CHOICES, default='Online')
    meeting_link  = models.URLField(blank=True)
    round         = models.PositiveIntegerField(default=1)

# ── Offers & Onboarding ───────────────────────────────────────────────
class Offer(models.Model):
    STATUS_CHOICES = [('Draft','Draft'),('Sent','Sent'),('Accepted','Accepted'),('Rejected','Rejected'),('Expired','Expired')]
    offer_id    = models.CharField(max_length=30, unique=True)
    candidate   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    candidate_name = models.CharField(max_length=200)
    role        = models.CharField(max_length=200)
    ctc         = models.CharField(max_length=100, blank=True)
    issued_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')

class OnboardingRecord(models.Model):
    STATUS_CHOICES = [
        ('Documents Pending','Documents Pending'),
        ('In Progress','In Progress'),
        ('Completed','Completed'),
    ]
    record_id     = models.CharField(max_length=30, unique=True)
    employee_name = models.CharField(max_length=200)
    role          = models.CharField(max_length=200)
    joining_date  = models.DateField(null=True, blank=True)
    employee_id   = models.CharField(max_length=50, blank=True)
    status        = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Documents Pending')
    offer         = models.OneToOneField(Offer, on_delete=models.SET_NULL, null=True, blank=True)
    # Task checklist (stored as booleans)
    task_profile      = models.BooleanField(default=False)
    task_offer        = models.BooleanField(default=False)
    task_docs_upload  = models.BooleanField(default=False)
    task_docs_verify  = models.BooleanField(default=False)
    task_bgc          = models.BooleanField(default=False)
    task_checkin      = models.BooleanField(default=False)
```

---

## 🔌 Step 5 — Build the API Endpoints

### All endpoints you need:

| Module | Method | Endpoint | Purpose |
|---|---|---|---|
| **Auth** | POST | `/api/auth/register/` | Candidate signup |
| | POST | `/api/auth/login/` | Get JWT token |
| | POST | `/api/auth/logout/` | Blacklist token |
| | GET/PUT | `/api/auth/me/` | Get/update own profile |
| **ExistingRoles** | GET | `/api/roles/` | List all roles (admin) |
| | POST | `/api/roles/` | Create role (admin) |
| | PUT/PATCH | `/api/roles/{id}/` | Update role |
| | DELETE | `/api/roles/{id}/` | Delete role |
| **RoleRequests** | GET | `/api/role-requests/` | List role requests |
| | POST | `/api/role-requests/` | Create a role request |
| | PATCH | `/api/role-requests/{id}/` | Update status |
| **JobRequests** | GET | `/api/job-requests/` | List job requests |
| | POST | `/api/job-requests/` | Create job request |
| | PATCH | `/api/job-requests/{id}/` | Update status |
| **ApprovalRequests** | GET | `/api/approvals/` | List approvals |
| | PATCH | `/api/approvals/{id}/` | Approve / Reject / Send Back |
| **JobPostings** | GET | `/api/job-postings/` | List (public: only Published) |
| | POST | `/api/job-postings/` | Create posting (admin) |
| | PATCH | `/api/job-postings/{id}/` | Update / publish |
| **Applications** | GET | `/api/applications/` | List all applications (admin) |
| | POST | `/api/applications/` | Submit application (candidate) |
| | GET | `/api/applications/mine/` | Candidate's own applications |
| | PATCH | `/api/applications/{id}/` | Update status (admin) |
| **GeneralApps** | GET | `/api/general-applications/` | List general applications |
| | POST | `/api/general-applications/` | Submit general application |
| **Interviews** | GET | `/api/interviews/` | List interviews |
| | POST | `/api/interviews/` | Schedule interview |
| | PATCH | `/api/interviews/{id}/` | Update score / status |
| **Panelists** | GET | `/api/panelists/` | List panelists |
| | POST | `/api/panelists/` | Add panelist |
| | DELETE | `/api/panelists/{id}/` | Remove panelist |
| **Offers** | GET | `/api/offers/` | List offers |
| | POST | `/api/offers/` | Create offer |
| | PATCH | `/api/offers/{id}/` | Update offer (CTC, status) |
| **Onboarding** | GET | `/api/onboarding/` | List onboarding records |
| | PATCH | `/api/onboarding/{id}/` | Update checklist tasks |
| **Dashboard** | GET | `/api/dashboard/stats/` | Counts for all modules |

---

## 📦 Step 6 — Write Serializers

```python
# recruitment/serializers.py

from rest_framework import serializers
from .models import (
    ExistingRole, RoleRequest, JobRequest, ApprovalRequest, ApprovalHistory,
    JobPosting, JobApplication, GeneralApplication, Panelist, Interview,
    Offer, OnboardingRecord, CandidateProfile, User
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role']
        extra_kwargs = {'password': {'write_only': True}}

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone']
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.role = 'candidate'
        user.save()
        CandidateProfile.objects.create(user=user)
        return user

class ExistingRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExistingRole
        fields = '__all__'

class RoleRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleRequest
        fields = '__all__'

class JobRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRequest
        fields = '__all__'

class ApprovalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalHistory
        fields = '__all__'

class ApprovalRequestSerializer(serializers.ModelSerializer):
    history = ApprovalHistorySerializer(many=True, read_only=True)
    class Meta:
        model = ApprovalRequest
        fields = '__all__'

class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.get_full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    class Meta:
        model = JobApplication
        fields = '__all__'

class GeneralApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralApplication
        fields = '__all__'

class PanelistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Panelist
        fields = '__all__'

class InterviewSerializer(serializers.ModelSerializer):
    panel_details = PanelistSerializer(source='panel', many=True, read_only=True)
    class Meta:
        model = Interview
        fields = '__all__'

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'

class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingRecord
        fields = '__all__'
```

---

## 🧩 Step 7 — Write Views (ViewSets)

```python
# recruitment/views.py (key examples)

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Count, Q
from .models import *
from .serializers import *

class IsHRAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class JobPostingViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostingSerializer

    def get_queryset(self):
        # Public: only Published postings (career page)
        if not self.request.user.is_authenticated or self.request.user.role == 'candidate':
            return JobPosting.objects.filter(status='Published')
        # Admin: all postings
        return JobPosting.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsHRAdmin()]

class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'candidate':
            return JobApplication.objects.filter(candidate=user)
        return JobApplication.objects.all()

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        apps = JobApplication.objects.filter(candidate=request.user)
        return Response(JobApplicationSerializer(apps, many=True).data)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsHRAdmin]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'pending_approvals': ApprovalRequest.objects.filter(status='Pending').count(),
            'open_postings': JobPosting.objects.filter(status='Published').count(),
            'total_applications': JobApplication.objects.count(),
            'interviews_scheduled': Interview.objects.filter(status='Scheduled').count(),
            'offers_sent': Offer.objects.filter(status='Sent').count(),
            'onboarding_pending': OnboardingRecord.objects.exclude(status='Completed').count(),
        })
```

---

## 🌐 Step 8 — Wire Up URLs

```python
# recruitment/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'roles',               views.ExistingRoleViewSet,      basename='roles')
router.register(r'role-requests',       views.RoleRequestViewSet,       basename='role-requests')
router.register(r'job-requests',        views.JobRequestViewSet,        basename='job-requests')
router.register(r'approvals',           views.ApprovalRequestViewSet,   basename='approvals')
router.register(r'job-postings',        views.JobPostingViewSet,        basename='job-postings')
router.register(r'applications',        views.JobApplicationViewSet,    basename='applications')
router.register(r'general-applications',views.GeneralApplicationViewSet,basename='general-applications')
router.register(r'interviews',          views.InterviewViewSet,         basename='interviews')
router.register(r'panelists',           views.PanelistViewSet,          basename='panelists')
router.register(r'offers',              views.OfferViewSet,             basename='offers')
router.register(r'onboarding',          views.OnboardingViewSet,        basename='onboarding')
router.register(r'dashboard',           views.DashboardViewSet,         basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/',   TokenObtainPairView.as_view(),  name='token_obtain'),
    path('auth/refresh/', TokenRefreshView.as_view(),     name='token_refresh'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/me/',       views.MeView.as_view(),        name='me'),
]

# rms_backend/urls.py
from django.urls import path, include
urlpatterns = [
    path('api/', include('recruitment.urls')),
    path('admin/', admin.site.urls),
]
```

---

## 🚀 Step 9 — Migrate & Run

```bash
# Create the DB in psql first
psql -U postgres
CREATE DATABASE rms_db;
CREATE USER rms_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE rms_db TO rms_user;
\q

# Run Django migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (HR Admin)
python manage.py createsuperuser

# Start dev server
python manage.py runserver
```

---

## 🔗 Step 10 — Connect Frontends to the API

### Replace localStorage calls with `fetch` / `axios`

**Example: career-page (fetch job postings)**

```typescript
// Before (localStorage / hardcoded)
const jobs = [...hardcoded array...];

// After (API call)
const [jobs, setJobs] = useState([]);
useEffect(() => {
  fetch('http://localhost:8000/api/job-postings/')
    .then(r => r.json())
    .then(setJobs);
}, []);
```

**Example: admin_dashboard (fetch approvals with JWT)**

```typescript
const token = localStorage.getItem('access_token');

const res = await fetch('http://localhost:8000/api/approvals/', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await res.json();
setApprovalRequests(data);
```

**Auth flow (career-page login):**

```typescript
const res = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: email, password })
});
const { access, refresh } = await res.json();
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);
```

---

## ✅ Recommended Build Order

```
Phase 1 — Foundation
  [x] Set up Django project + PostgreSQL
  [x] Define all models
  [x] Run migrations
  [x] Register models in Django admin

Phase 2 — Auth APIs
  [ ] POST /api/auth/register/
  [ ] POST /api/auth/login/ (JWT)
  [ ] GET/PUT /api/auth/me/

Phase 3 — Admin Dashboard APIs (in dependency order)
  [ ] Existing Roles (no deps)
  [ ] Role Requests → Existing Roles
  [ ] Job Requests → Existing Roles
  [ ] Approval Requests → Role Requests + Job Requests
  [ ] Job Postings → Job Requests
  [ ] Panelists (no deps)
  [ ] Applications → Job Postings
  [ ] Interviews → Applications + Panelists
  [ ] Offers → Interviews
  [ ] Onboarding → Offers
  [ ] Dashboard Stats (aggregates all)

Phase 4 — Career Page APIs
  [ ] Public job listings (GET /api/job-postings/?status=Published)
  [ ] Submit application (POST /api/applications/)
  [ ] Submit general application (POST /api/general-applications/)
  [ ] Candidate dashboard (GET /api/applications/mine/)

Phase 5 — Connect Frontends
  [ ] Replace localStorage in admin_dashboard with API calls
  [ ] Replace hardcoded jobs in career-page with API calls
  [ ] Add JWT token management (login, refresh, logout)

Phase 6 — Polish
  [ ] File upload for resumes (S3 / local media)
  [ ] Email notifications (django-email)
  [ ] Pagination (PageNumberPagination)
  [ ] Filtering (django-filter)
  [ ] Deployment (Gunicorn + Nginx / Railway / Render)
```

---

> [!TIP]
> Start with **Phase 1 + 2** first. Once auth works end-to-end, tackle admin APIs in the dependency order shown above — each module feeds the next.

> [!IMPORTANT]
> Both frontends are on different Vite ports (5173 and 5174). Make sure **CORS_ALLOWED_ORIGINS** in `settings.py` includes both. Later in production, replace with your actual domain.

> [!NOTE]
> The career-page already pings `https://career-page-ksip.onrender.com` — you can deploy your Django backend to **Render** or **Railway** as a free PostgreSQL + Django service for staging.
