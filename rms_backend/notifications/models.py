from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class Notification(models.Model):
    TYPE_CHOICES = [
        ("application_status", "Application Status Change"),
        ("interview_scheduled","Interview Scheduled"),
        ("offer_received",     "Offer Received"),
        ("offer_accepted",     "Offer Accepted"),
        ("onboarding",         "Onboarding Update"),
        ("general",            "General"),
    ]

    recipient   = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="notifications")
    sender      = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="notifications_sent")
    type        = models.CharField(max_length=30, choices=TYPE_CHOICES, default="general")
    title       = models.CharField(max_length=200)
    message     = models.TextField()
    is_read     = models.BooleanField(default=False)
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id    = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notif → {self.recipient.email}: {self.title}"
