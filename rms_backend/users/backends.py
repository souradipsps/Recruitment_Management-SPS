from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrPhoneBackend(ModelBackend):
    """
    Custom authentication backend that allows candidates/users to log in
    using either their email address or their 10-digit phone number.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD) or kwargs.get("email")
            
        if not username:
            return None

        # Clean/strip email or phone value
        username = str(username).strip()
        
        # Match either email (case-insensitive) or phone exactly.
        # Iterate over all matching users to find the one with the correct password.
        users = User.objects.filter(Q(email__iexact=username) | Q(phone=username))
        for user in users:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None
