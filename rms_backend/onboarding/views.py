from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsHRAdmin
from .models import Offer, OnboardingRecord
from .serializers import OfferSerializer, OnboardingSerializer, OnboardingTaskSerializer
from users.utils import auto_id, ConditionalPagination

class OfferViewSet(viewsets.ModelViewSet):
    serializer_class = OfferSerializer
    pagination_class = ConditionalPagination

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return Offer.objects.filter(candidate=user).select_related("candidate", "onboarding", "existing_role")
        return Offer.objects.all().select_related("candidate", "onboarding", "existing_role")

    def get_permissions(self):
        if self.action in ["list", "retrieve", "accept", "decline"]:
            return [IsAuthenticated()]
        return [IsHRAdmin()]

    def perform_create(self, serializer):
        offer = serializer.save()
        if offer.status == "Sent":
            self.send_offer_email(offer)

    def perform_update(self, serializer):
        old_status = self.get_object().status
        offer = serializer.save()
        if offer.status == "Sent" and old_status != "Sent":
            self.send_offer_email(offer)

    def send_offer_email(self, offer):
        from notifications.tasks import send_offer_email_task, create_notification_task
        send_offer_email_task.delay(offer.id)
        if offer.candidate:
            create_notification_task.delay(
                recipient_id=offer.candidate.id,
                notification_type="offer_received",
                title="Offer Letter Issued",
                message=f"You have received an offer letter for the position of {offer.role}. Please review and respond.",
            )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        offer = self.get_object()
        if offer.candidate != request.user and request.user.role != "admin":
            return Response({"error": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        offer.status = "Accepted"
        offer.save()
        if not hasattr(offer, "onboarding"):
            OnboardingRecord.objects.create(
                record_id=auto_id("ONB", OnboardingRecord),
                employee_name=offer.candidate_name,
                role=offer.role,
                existing_role=offer.existing_role,
                joining_date=offer.joining_date,
                offer=offer,
                candidate=offer.candidate,
            )
        from notifications.tasks import create_notification_task
        create_notification_task.delay(
            recipient_id=offer.candidate.id,
            notification_type="offer_accepted",
            title="Offer Accepted",
            message=f"You have accepted the offer for {offer.role}. Onboarding has been initiated.",
        )
        return Response(OfferSerializer(offer).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def decline(self, request, pk=None):
        offer = self.get_object()
        if offer.candidate != request.user and request.user.role != "admin":
            return Response({"error": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        offer.status = "Rejected"
        offer.save()
        return Response(OfferSerializer(offer).data)


class OnboardingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = ConditionalPagination

    # Same doc-key <-> file-field mapping the frontend uses (see
    # careerpage_frontend's offersService.js / CandidateDashboard.jsx).
    DOC_FIELD_TO_KEY = {
        "aadhar_card": "aadhar",
        "pan_card": "pan",
        "bank_passbook": "bank_details",
        "passport_photo": "photo",
        "driving_license": "driving_license",
        "class10_marksheet": "class10",
        "class12_marksheet": "class12",
        "degree_certificate": "degree",
        "experience_certificate": "experience_cert",
        "professional_certificate": "prof_cert",
    }

    def get_queryset(self):
        if self.request.user.role == "candidate":
            qs = OnboardingRecord.objects.filter(candidate=self.request.user).select_related("offer", "candidate", "candidate__profile", "existing_role")
        else:
            qs = OnboardingRecord.objects.all().select_related("offer", "candidate", "candidate__profile", "existing_role")

        for record in qs:
            needs_save = False
            if not record.task_profile and record.candidate and hasattr(record.candidate, "profile"):
                record.task_profile = True
                needs_save = True
            if not record.task_offer and record.offer and record.offer.status == "Accepted":
                record.task_offer = True
                needs_save = True
            if needs_save:
                record.save()
        return qs

    def get_serializer_class(self):
        if self.action == "tasks":
            return OnboardingTaskSerializer
        return OnboardingSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy", "tasks"]:
            return [IsHRAdmin()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        # A candidate re-uploading a document that HR previously rejected
        # or verified should clear it out of verified_docs / rejected_docs,
        # so it goes back to "pending" review instead of staying stuck.
        # Also reset the overall task_docs_verify status to False since
        # documents need to be verified again.
        instance = serializer.instance
        data = self.request.data
        files = self.request.FILES

        reuploaded_keys = set()

        # Helper to check if text value changed
        def val_changed(field_name, new_val):
            if new_val is None:
                return False
            old_val = getattr(instance, field_name) or ""
            return str(new_val).strip() != str(old_val).strip()

        # Check Aadhar
        if "aadhar_card" in files:
            reuploaded_keys.add("aadhar")
        elif "aadhar_number" in data:
            new_num = str(data["aadhar_number"]).replace(" ", "")
            old_num = str(instance.aadhar_number or "").replace(" ", "")
            if new_num != old_num:
                reuploaded_keys.add("aadhar")

        # Check PAN
        if "pan_card" in files:
            reuploaded_keys.add("pan")
        elif "pan_number" in data and val_changed("pan_number", data["pan_number"]):
            reuploaded_keys.add("pan")

        # Check Bank Details
        bank_fields = ["bank_holder_name", "bank_account_number", "bank_ifsc", "bank_name"]
        if "bank_passbook" in files:
            reuploaded_keys.add("bank_details")
        else:
            for bf in bank_fields:
                if bf in data and val_changed(bf, data[bf]):
                    reuploaded_keys.add("bank_details")
                    break

        # Check all other documents (which only have files)
        for field, key in self.DOC_FIELD_TO_KEY.items():
            if key not in ["aadhar", "pan", "bank_details"]:
                if field in files:
                    reuploaded_keys.add(key)

        if reuploaded_keys:
            import json
            try:
                rejected = json.loads(instance.rejected_docs or "[]")
            except (TypeError, ValueError):
                rejected = []
            try:
                verified = json.loads(instance.verified_docs or "[]")
            except (TypeError, ValueError):
                verified = []

            new_rejected = [k for k in rejected if k not in reuploaded_keys]
            new_verified = [k for k in verified if k not in reuploaded_keys]

            extra_kwargs = {}
            if len(new_rejected) != len(rejected):
                extra_kwargs["rejected_docs"] = json.dumps(new_rejected)
            if len(new_verified) != len(verified):
                extra_kwargs["verified_docs"] = json.dumps(new_verified)

            # Since a document is being reuploaded/modified, the overall verification
            # status task_docs_verify needs to go back to False
            if instance.task_docs_verify:
                extra_kwargs["task_docs_verify"] = False
                if instance.status == "Completed":
                    extra_kwargs["status"] = "In Progress"

            if extra_kwargs:
                serializer.save(**extra_kwargs)
                return
        serializer.save()

    @action(detail=True, methods=["patch"], permission_classes=[IsHRAdmin])
    def tasks(self, request, pk=None):
        record = self.get_object()
        serializer = OnboardingTaskSerializer(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        record.refresh_from_db()
        if record.completion_percentage == 100 and record.status != "Completed":
            record.status = "Completed"
            record.save()
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                subject = f"Onboarding Completed & Joining Confirmation — {record.employee_name}"
                message = (
                    f"Dear {record.employee_name},\n\n"
                    f"Congratulations! We are pleased to inform you that your onboarding process has been successfully completed, "
                    f"and all your submitted documents have been verified.\n\n"
                    f"Please find your joining details below:\n"
                    f"- Role: {record.role}\n"
                    f"- Joining Date: {record.joining_date}\n\n"
                    f"We are excited to welcome you to the South Point School team on your Day 1!\n\n"
                    f"Best regards,\n"
                    f"HR Team\n"
                    f"South Point School"
                )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[record.candidate.email],
                    fail_silently=False,
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send joining confirmation email: {e}")
        return Response(OnboardingSerializer(record).data)
