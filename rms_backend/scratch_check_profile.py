import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rms_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users = User.objects.all()
for u in users:
    print(f"ID: {u.id}, Email: {u.email}, Phone: {repr(u.phone)}")
