import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rms_backend.settings')
django.setup()

from users.models import CandidateProfile

profiles = CandidateProfile.objects.all()
for p in profiles:
    print(f"User: {p.user.email}, Profile Pic Length: {len(p.profile_picture) if p.profile_picture else 0}")
