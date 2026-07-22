from rest_framework import serializers
from users.utils import auto_id
from .models import JobApplication, GeneralApplication
from jobs.models import JobPosting

def get_profile_location(candidate):
    profile = getattr(candidate, "profile", None)
    return profile.current_location if profile else ""

def get_profile_skills(candidate):
    profile = getattr(candidate, "profile", None)
    return profile.skills if profile else []

def get_profile_salary(candidate):
    profile = getattr(candidate, "profile", None)
    return profile.salary_expectation if profile else ""

def get_profile_educational_qualification(obj):
    if obj.qualification:
        return obj.qualification
    profile = getattr(obj.candidate, "profile", None)
    if profile:
        edu = profile.educational_qualification or ""
        deg = profile.degree_name or ""
        return f"{edu} ({deg})" if (edu and deg) else (edu or deg or "")
    return ""

def get_profile_professional_qualification(candidate):
    profile = getattr(candidate, "profile", None)
    if not profile:
        return ""
    edu = profile.professional_qualification or ""
    deg = profile.professional_degree_name or ""
    return f"{edu} ({deg})" if (edu and deg) else (edu or deg or "")

def get_profile_extracurricular_qualification(candidate):
    profile = getattr(candidate, "profile", None)
    if not profile:
        return ""
    edu = profile.extracurricular_qualification or ""
    deg = profile.extracurricular_degree_name or ""
    return f"{edu} ({deg})" if (edu and deg) else (edu or deg or "")


class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.SerializerMethodField(read_only=True)
    candidate_email = serializers.SerializerMethodField(read_only=True)
    candidate_phone = serializers.SerializerMethodField(read_only=True)
    posting_title   = serializers.SerializerMethodField(read_only=True)
    resume          = serializers.SerializerMethodField(read_only=True)
    posting_id      = serializers.ReadOnlyField(source="posting.posting_id")
    location        = serializers.SerializerMethodField(read_only=True)
    skills          = serializers.SerializerMethodField(read_only=True)
    salary          = serializers.SerializerMethodField(read_only=True)
    educational_qualification = serializers.SerializerMethodField(read_only=True)
    professional_qualification = serializers.SerializerMethodField(read_only=True)
    extracurricular_qualification = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = JobApplication
        fields = "__all__"
        read_only_fields = ["app_id", "role", "applied_date", "candidate", "updated_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user and request.user.role == "candidate":
            if "status" in self.fields:
                self.fields["status"].read_only = True
            if "admin_note" in self.fields:
                self.fields["admin_note"].read_only = True

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get("request")
        if request and request.user and request.user.role == "candidate":
            if ret.get("status") == "Shortlisted":
                has_scheduled_interview = instance.interviews.filter(
                    status__in=["Scheduled", "Completed", "Rescheduled"]
                ).exists()
                if not has_scheduled_interview:
                    from interviews.models import Interview
                    full_name = instance.candidate.get_full_name().strip()
                    has_scheduled_interview = Interview.objects.filter(
                        candidate_name__iexact=full_name,
                        role__iexact=instance.role,
                        status__in=["Scheduled", "Completed", "Rescheduled"]
                    ).exists()
                if not has_scheduled_interview:
                    ret["status"] = "Under Review"
        return ret


    def get_candidate_name(self, obj):
        return obj.candidate.get_full_name()

    def get_candidate_email(self, obj):
        return obj.candidate.email

    def get_candidate_phone(self, obj):
        return obj.candidate.phone

    def get_posting_title(self, obj):
        return obj.posting.role if obj.posting else obj.role

    def get_resume(self, obj):
        request = self.context.get("request")
        profile = getattr(obj.candidate, "profile", None)
        if profile and profile.resume:
            url = profile.resume.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_location(self, obj):
        return get_profile_location(obj.candidate)

    def get_skills(self, obj):
        return get_profile_skills(obj.candidate)

    def get_salary(self, obj):
        return get_profile_salary(obj.candidate)

    def get_educational_qualification(self, obj):
        return get_profile_educational_qualification(obj)

    def get_professional_qualification(self, obj):
        return get_profile_professional_qualification(obj.candidate)

    def get_extracurricular_qualification(self, obj):
        return get_profile_extracurricular_qualification(obj.candidate)

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
        validated_data["app_id"] = auto_id("JAPP", JobApplication)
        user = self.context["request"].user
        validated_data["candidate"] = user
        if validated_data.get("posting"):
            validated_data["role"] = validated_data["posting"].role

        # If experience or qualification are not provided, populate from profile
        profile = getattr(user, "profile", None)
        if profile:
            if not validated_data.get("experience"):
                validated_data["experience"] = profile.years_of_experience
            if not validated_data.get("qualification"):
                edu = profile.educational_qualification or ""
                deg = profile.degree_name or ""
                validated_data["qualification"] = f"{edu} ({deg})" if (edu and deg) else (edu or deg or "")

        return super().create(validated_data)


class JobApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = JobApplication
        fields = ["status", "admin_note"]


class GeneralApplicationSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.SerializerMethodField(read_only=True)
    candidate_email = serializers.SerializerMethodField(read_only=True)
    candidate_phone = serializers.SerializerMethodField(read_only=True)
    resume          = serializers.SerializerMethodField(read_only=True)
    location        = serializers.SerializerMethodField(read_only=True)
    skills          = serializers.SerializerMethodField(read_only=True)
    salary          = serializers.SerializerMethodField(read_only=True)
    educational_qualification = serializers.SerializerMethodField(read_only=True)
    professional_qualification = serializers.SerializerMethodField(read_only=True)
    extracurricular_qualification = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = GeneralApplication
        fields = "__all__"
        read_only_fields = ["app_id", "applied_date", "candidate"]

    def validate(self, attrs):
        request = self.context.get("request")
        if (
            request
            and request.user
            and not self.instance
            and GeneralApplication.objects.filter(
                candidate=request.user
            ).exists()
        ):
            raise serializers.ValidationError(
                "You have already submitted a general application."
            )
        return attrs

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user and request.user.role == "candidate":
            if "status" in self.fields:
                self.fields["status"].read_only = True
            if "admin_note" in self.fields:
                self.fields["admin_note"].read_only = True

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get("request")
        if request and request.user and request.user.role == "candidate":
            if ret.get("status") == "Shortlisted":
                from interviews.models import Interview
                full_name = instance.candidate.get_full_name().strip()
                has_scheduled = Interview.objects.filter(
                    candidate_name__iexact=full_name,
                    status__in=["Scheduled", "Completed", "Rescheduled"]
                ).exists()
                if not has_scheduled:
                    ret["status"] = "Under Review"
        return ret


    def get_candidate_name(self, obj):
        return obj.candidate.get_full_name()

    def get_candidate_email(self, obj):
        return obj.candidate.email

    def get_candidate_phone(self, obj):
        return obj.candidate.phone

    def get_resume(self, obj):
        request = self.context.get("request")
        profile = getattr(obj.candidate, "profile", None)
        if profile and profile.resume:
            url = profile.resume.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_location(self, obj):
        return get_profile_location(obj.candidate)

    def get_skills(self, obj):
        return get_profile_skills(obj.candidate)

    def get_salary(self, obj):
        return get_profile_salary(obj.candidate)

    def get_educational_qualification(self, obj):
        return get_profile_educational_qualification(obj)

    def get_professional_qualification(self, obj):
        return get_profile_professional_qualification(obj.candidate)

    def get_extracurricular_qualification(self, obj):
        return get_profile_extracurricular_qualification(obj.candidate)

    def create(self, validated_data):
        validated_data["app_id"] = auto_id("GAPP", GeneralApplication)
        user = self.context["request"].user
        validated_data["candidate"] = user

        profile = getattr(user, "profile", None)
        if profile:
            if not validated_data.get("experience"):
                validated_data["experience"] = profile.years_of_experience
            if not validated_data.get("preferred_role"):
                validated_data["preferred_role"] = ", ".join(profile.roles_interested) if profile.roles_interested else ""

        # Dynamically map preferred_role string or list onto existing_role relation
        preferred_role_str = validated_data.get("preferred_role", "")
        if preferred_role_str and not validated_data.get("existing_role"):
            import json
            from jobs.models import ExistingRole
            roles_list = []
            try:
                parsed = json.loads(preferred_role_str)
                if isinstance(parsed, list):
                    roles_list = parsed
                else:
                    roles_list = [str(parsed)]
            except Exception:
                roles_list = [preferred_role_str]

            matched = None
            for rname in roles_list:
                matched = ExistingRole.objects.filter(role__iexact=rname.strip()).first()
                if matched:
                    break
            if matched:
                validated_data["existing_role"] = matched
            elif profile:
                validated_data["existing_role"] = profile.interested_roles.first()

        return super().create(validated_data)

