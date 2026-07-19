import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from onboarding.models import OnboardingRecord, Offer

User = get_user_model()

class OnboardingDocReuploadTestCase(APITestCase):
    def setUp(self):
        # Create candidate user
        self.candidate = User.objects.create_user(
            email="candidate@school.com",
            password="testpassword",
            first_name="Candidate",
            last_name="User",
            role="candidate"
        )
        # Create an accepted offer
        self.offer = Offer.objects.create(
            offer_id="OFR-2026-0001",
            candidate=self.candidate,
            candidate_name="Candidate User",
            role="Science Teacher",
            status="Accepted"
        )
        # Create onboarding record
        self.record = OnboardingRecord.objects.create(
            record_id="ONB-2026-0001",
            employee_name="Candidate User",
            role="Science Teacher",
            offer=self.offer,
            candidate=self.candidate,
            task_docs_verify=True,
            verified_docs=json.dumps(["aadhar", "pan"]),
            rejected_docs=json.dumps(["bank_details"]),
            status="Completed"
        )
        self.client.force_authenticate(user=self.candidate)

    def test_reupload_document_clears_verification_states(self):
        # Re-upload the bank passbook (bank_details)
        url = reverse("onboarding-detail", kwargs={"pk": self.record.id})
        
        new_file = SimpleUploadedFile("passbook.png", b"file_content", content_type="image/png")
        data = {
            "bank_account_number": "9876543210", # Changed from blank to check text details modification
            "bank_passbook": new_file,
        }
        
        response = self.client.patch(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Reload record from DB
        self.record.refresh_from_db()
        
        # Verify that bank_details is cleared from rejected_docs
        rejected = json.loads(self.record.rejected_docs)
        self.assertNotIn("bank_details", rejected)
        
        # Verify that bank_details is cleared from verified_docs
        verified = json.loads(self.record.verified_docs)
        self.assertNotIn("bank_details", verified)
        
        # Verify that task_docs_verify is set to False
        self.assertFalse(self.record.task_docs_verify)
        
        # Verify that status is In Progress (no longer Completed)
        self.assertEqual(self.record.status, "In Progress")

    def test_change_text_only_clears_verification_states(self):
        # Change pan_number which should reset pan verification
        url = reverse("onboarding-detail", kwargs={"pk": self.record.id})
        data = {
            "pan_number": "ABCDE5678F",
        }
        response = self.client.patch(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.record.refresh_from_db()
        
        # Verify that pan is cleared from verified_docs
        verified = json.loads(self.record.verified_docs)
        self.assertNotIn("pan", verified)
        self.assertFalse(self.record.task_docs_verify)
        self.assertEqual(self.record.status, "In Progress")
