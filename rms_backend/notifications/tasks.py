from rms_backend.celery_utils import custom_shared_task as shared_task
from django.contrib.auth import get_user_model
from django.conf import settings
# pyrefly: ignore [missing-import]
from .models import Notification


def format_time_ampm(t):
    if not t:
        return ""
    if isinstance(t, str):
        try:
            from datetime import datetime
            parsed_t = datetime.strptime(t, "%H:%M:%S").time()
            t = parsed_t
        except ValueError:
            try:
                parsed_t = datetime.strptime(t, "%H:%M").time()
                t = parsed_t
            except ValueError:
                return t
    
    formatted = t.strftime("%I:%M %p")
    if formatted.startswith("0"):
        formatted = formatted[1:]
    return formatted



def get_interview_email_html(title, name, round_num, role, candidate_name, date, time, mode, meeting_link, intro_text=None, completed_scores_html=None):
    badge_class = "badge-online" if mode == "Online" else "badge-offline"
    
    # Meeting link formatting
    meeting_link_row = ""
    join_button = ""
    if mode == "Online" and meeting_link:
        meeting_link_row = f"""
          <div class="info-row" style="margin-bottom: 12px; font-size: 14px; display: block;">
            <span class="info-label" style="font-weight: 700; color: #374151; display: inline-block; width: 120px;">Meeting Link:</span>
            <span class="info-value" style="color: #4B5563;"><a href="{meeting_link}" target="_blank" style="color: #7B1FA2; text-decoration: underline;">{meeting_link}</a></span>
          </div>
        """
        join_button = f"""
        <div class="btn-container" style="text-align: center; margin: 28px 0 12px;">
          <a href="{meeting_link}" class="btn" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%); color: #FFFFFF !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(123, 31, 162, 0.3);">Join Interview Meeting</a>
        </div>
        """

    # If intro text is not overridden, fall back to standard text
    if not intro_text:
        intro_text = f"This is to notify you regarding the Round {round_num} interview for the position of <strong>{role}</strong>."

    # Build the main body card depending on whether it is a completed round summary or scheduled details
    if completed_scores_html:
        details_card = f"""
        <div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div class="card-title" style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; margin-bottom: 12px;">Evaluation Summary</div>
          {completed_scores_html}
        </div>
        """
    else:
        details_card = f"""
        <div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div class="card-title" style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; margin-bottom: 12px;">Interview details</div>
          <div class="info-row" style="margin-bottom: 12px; font-size: 14px; display: block;">
            <span class="info-label" style="font-weight: 700; color: #374151; display: inline-block; width: 120px;">Candidate:</span>
            <span class="info-value" style="color: #4B5563;">{candidate_name}</span>
          </div>
          <div class="info-row" style="margin-bottom: 12px; font-size: 14px; display: block;">
            <span class="info-label" style="font-weight: 700; color: #374151; display: inline-block; width: 120px;">Date:</span>
            <span class="info-value" style="color: #4B5563;">{date}</span>
          </div>
          <div class="info-row" style="margin-bottom: 12px; font-size: 14px; display: block;">
            <span class="info-label" style="font-weight: 700; color: #374151; display: inline-block; width: 120px;">Time:</span>
            <span class="info-value" style="color: #4B5563;">{time}</span>
          </div>
          <div class="info-row" style="margin-bottom: 12px; font-size: 14px; display: block;">
            <span class="info-label" style="font-weight: 700; color: #374151; display: inline-block; width: 120px;">Mode:</span>
            <span class="info-value" style="color: #4B5563;">
              <span class="badge {badge_class}" style="display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">{mode}</span>
            </span>
          </div>
          {meeting_link_row}
        </div>
        """

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F3F4F6;
      color: #1F2937;
      margin: 0;
      padding: 0;
    }}
    .wrapper {{
      width: 100%;
      background-color: #F3F4F6;
      padding: 40px 20px;
    }}
    .container {{
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #E5E7EB;
      overflow: hidden;
    }}
    .header {{
      background: linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%);
      padding: 32px 24px;
      text-align: center;
      color: #FFFFFF;
    }}
    .header h1 {{
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
    }}
    .header p {{
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.9;
      color: #FFFFFF;
    }}
    .content {{
      padding: 32px 24px;
    }}
    .greeting {{
      font-size: 16px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      color: #111827;
    }}
    .intro {{
      font-size: 15px;
      line-height: 1.6;
      color: #4B5563;
      margin-bottom: 24px;
    }}
    .footer {{
      background-color: #F9FAFB;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
      border-top: 1px solid #F3F4F6;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>{title}</h1>
        <p>South Point School Recruitment Team</p>
      </div>
      <div class="content">
        <p class="greeting">Dear {name},</p>
        <p class="intro">
          {intro_text}
        </p>
        
        {details_card}

        {join_button}
      </div>
      <div class="footer">
        &copy; 2026 South Point School. All rights reserved.<br>
        Guwahati, Assam, India
      </div>
    </div>
  </div>
</body>
</html>
"""


@shared_task
def create_notification_task(recipient_id, notification_type, title, message):
    """
    Asynchronously creates a notification database record.
    Decoupled from request-response flow to optimize response times.
    """
    User = get_user_model()
    try:
        recipient = User.objects.get(id=recipient_id)
        notification = Notification.objects.create(
            recipient=recipient,
            type=notification_type,
            title=title,
            message=message
        )
        return f"Notification {notification.id} created for {recipient.email}"
    except User.DoesNotExist:
        return f"User with id {recipient_id} does not exist"


@shared_task
def send_interview_email_task(interview_id, is_reschedule=False):
    """
    Sends notification emails to the candidate and all panelists assigned to the interview.
    """
    from interviews.models import Interview
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    formatted_time = format_time_ampm(interview.time)

    if is_reschedule:
        subject = f"Interview Rescheduled: {interview.role} - Round {interview.round}"
    else:
        subject = f"Interview Scheduled: {interview.role} - Round {interview.round}"

    # 1. Email to Candidate
    candidate = interview.application.candidate if interview.application else (interview.general_application.candidate if interview.general_application else None)
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import JobApplication
        app = JobApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import GeneralApplication
        app = GeneralApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, preferred_role__icontains=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=interview.candidate_name).first()

    if candidate:
        if is_reschedule:
            candidate_body = f"""Dear {candidate.get_full_name() or "Candidate"},

Your Round {interview.round} interview for the role of '{interview.role}' has been rescheduled.

Updated Details:
Date: {interview.date}
Time: {formatted_time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Please be prepared.

Best regards,
South Point School Recruitment Team
"""
            intro_text = f"Your Round {interview.round} interview for the role of '{interview.role}' has been rescheduled. Please find the updated details below:"
        else:
            candidate_body = f"""Dear {candidate.get_full_name() or "Candidate"},

Your Round {interview.round} interview for the role of '{interview.role}' has been scheduled.

Details:
Date: {interview.date}
Time: {formatted_time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Please be prepared.

Best regards,
South Point School Recruitment Team
"""
            intro_text = f"Your Round {interview.round} interview for the role of '{interview.role}' has been scheduled. Please find the details below:"

        title_text = "Interview Rescheduled" if is_reschedule else "Interview Scheduled"
        candidate_html = get_interview_email_html(
            title=title_text,
            name=candidate.get_full_name() or "Candidate",
            round_num=interview.round,
            role=interview.role,
            candidate_name=interview.candidate_name,
            date=interview.date,
            time=formatted_time,
            mode=interview.mode,
            meeting_link=interview.meeting_link,
            intro_text=intro_text,
        )
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=candidate_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            fail_silently=False,
            html_message=candidate_html,
        )

    # 2. Email to Panelists
    panelists = interview.panel.all()
    for panelist in panelists:
        if is_reschedule:
            panelist_body = f"""Dear {panelist.name},

The Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}', where you are assigned as a panelist, has been rescheduled.

Updated Details:
Date: {interview.date}
Time: {formatted_time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Best regards,
South Point School Recruitment Team
"""
            intro_text = f"The Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}', where you are assigned as a panelist, has been rescheduled."
        else:
            panelist_body = f"""Dear {panelist.name},

You have been assigned as a panelist for the Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}'.

Details:
Date: {interview.date}
Time: {formatted_time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Best regards,
South Point School Recruitment Team
"""
            intro_text = f"You have been assigned as a panelist for the Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}'."

        title_text = "Interview Rescheduled (Panelist)" if is_reschedule else "Interview Scheduled (Panelist)"
        panelist_html = get_interview_email_html(
            title=title_text,
            name=panelist.name,
            round_num=interview.round,
            role=interview.role,
            candidate_name=interview.candidate_name,
            date=interview.date,
            time=formatted_time,
            mode=interview.mode,
            meeting_link=interview.meeting_link,
            intro_text=intro_text,
        )
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=panelist_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[panelist.email],
            fail_silently=False,
            html_message=panelist_html,
        )

    return f"Sent interview scheduling/rescheduling emails for {interview.interview_id}"


@shared_task
def send_new_panelists_email_task(interview_id, new_panelist_ids):
    """
    Sends notification emails only to the newly assigned/added panelists.
    """
    from interviews.models import Interview, Panelist
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    formatted_time = format_time_ampm(interview.time)
    subject = f"Assigned as Panelist: {interview.role} - Round {interview.round}"
    
    panelists = Panelist.objects.filter(id__in=new_panelist_ids)
    for panelist in panelists:
        panelist_body = f"""Dear {panelist.name},

You have been assigned as a panelist for the Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}'.

Details:
Date: {interview.date}
Time: {formatted_time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Best regards,
South Point School Recruitment Team
"""
        intro_text = f"You have been assigned as a panelist for the Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}'."
        panelist_html = get_interview_email_html(
            title="Interview Assignment as Panelist",
            name=panelist.name,
            round_num=interview.round,
            role=interview.role,
            candidate_name=interview.candidate_name,
            date=interview.date,
            time=formatted_time,
            mode=interview.mode,
            meeting_link=interview.meeting_link,
            intro_text=intro_text,
        )
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=panelist_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[panelist.email],
            fail_silently=False,
            html_message=panelist_html,
        )

    return f"Sent assignment email to newly added panelists for interview {interview.interview_id}"



@shared_task
def send_interview_reminder_task(interview_id):
    """
    Sends reminder emails to the candidate and all panelists assigned to the interview.
    """
    from interviews.models import Interview
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    formatted_time = format_time_ampm(interview.time)
    subject = f"Reminder: Upcoming Interview for {interview.role} - Round {interview.round}"

    # 1. Email to Candidate
    candidate = interview.application.candidate if interview.application else (interview.general_application.candidate if interview.general_application else None)
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import JobApplication
        app = JobApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import GeneralApplication
        app = GeneralApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, preferred_role__icontains=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=interview.candidate_name).first()

    if candidate:
        candidate_body = f"""Dear {candidate.get_full_name() or "Candidate"},

This is a reminder that your Round {interview.round} interview for the role of '{interview.role}' is scheduled.

Details:
Date: {interview.date}
Time: {formatted_time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Please ensure you join on time.

Best regards,
South Point School Recruitment Team
"""
        candidate_html = get_interview_email_html(
            title=f"Reminder: Upcoming Interview for {interview.role}",
            name=candidate.get_full_name() or "Candidate",
            round_num=interview.round,
            role=interview.role,
            candidate_name=interview.candidate_name,
            date=interview.date,
            time=formatted_time,
            mode=interview.mode,
            meeting_link=interview.meeting_link,
        )
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=candidate_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            fail_silently=False,
            html_message=candidate_html,
        )

    # 2. Email to Panelists
    panelists = interview.panel.all()
    for panelist in panelists:
        panelist_body = f"""Dear {panelist.name},

This is a reminder that you are assigned as a panelist for the upcoming Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}'.

Details:
Date: {interview.date}
Time: {formatted_time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Best regards,
South Point School Recruitment Team
"""
        panelist_html = get_interview_email_html(
            title=f"Reminder: Upcoming Interview as Panelist",
            name=panelist.name,
            round_num=interview.round,
            role=interview.role,
            candidate_name=interview.candidate_name,
            date=interview.date,
            time=formatted_time,
            mode=interview.mode,
            meeting_link=interview.meeting_link,
        )
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=panelist_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[panelist.email],
            fail_silently=False,
            html_message=panelist_html,
        )

    return f"Sent interview reminder emails for {interview.interview_id}"


@shared_task
def send_offer_email_task(offer_id):
    """
    Sends an offer letter notification email to the candidate.
    """
    from onboarding.models import Offer
    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return f"Offer with id {offer_id} does not exist"

    candidate = offer.candidate
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=offer.candidate_name).first()

    if not candidate:
        from applications.models import JobApplication, GeneralApplication
        app = JobApplication.objects.filter(candidate__first_name__iexact=offer.candidate_name.split()[0]).first()
        email = app.candidate.email if app else None
        if not email:
            app2 = GeneralApplication.objects.filter(candidate__first_name__iexact=offer.candidate_name.split()[0]).first()
            email = app2.candidate.email if app2 else None
        if not email:
            return f"No candidate email found for {offer.candidate_name}"
    else:
        email = candidate.email

    subject = f"Offer Letter Issued: {offer.role} - South Point School"
    body = f"""Dear {offer.candidate_name},

We are pleased to inform you that an offer letter has been issued to you for the position of '{offer.role}' at South Point School.

Offer Details:
Offer ID: {offer.offer_id}
Position: {offer.role}
CTC: {offer.ctc}
Expected Joining Date: {offer.joining_date}
Offer Expiry Date: {offer.expiry_date}

Please log in to your candidate dashboard to view the full offer letter details and submit your response (Accept / Decline).

Candidate Dashboard: http://localhost:5173/dashboard

Best regards,
South Point School Recruitment Team
"""

    from django.core.mail import send_mail
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
    return f"Sent offer letter email to {email} for offer {offer.offer_id}"


@shared_task
def send_interview_completed_email_task(interview_id):
    """
    Sends email notification to the candidate with their overall average scores for completed rounds.
    """
    from interviews.models import Interview
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    formatted_time = format_time_ampm(interview.time)

    # Find candidate
    candidate = interview.application.candidate if interview.application else (interview.general_application.candidate if interview.general_application else None)
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import JobApplication
        app = JobApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import GeneralApplication
        app = GeneralApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, preferred_role__icontains=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=interview.candidate_name).first()

    if not candidate:
        return f"Could not find candidate profile for email lookup: {interview.candidate_name}"

    # Get all completed rounds for this candidate and role
    completed_interviews = Interview.objects.filter(
        candidate_name=interview.candidate_name,
        role=interview.role,
        status="Completed"
    ).order_by("round")

    round_summaries = []
    completed_scores_html = ""
    for r_inv in completed_interviews:
        round_summaries.append(f"- Round {r_inv.round}: {r_inv.score}/100")
        completed_scores_html += f"""
        <div class="info-row" style="margin-bottom: 12px; font-size: 14px; display: block;">
          <span class="info-label" style="font-weight: 700; color: #374151; display: inline-block; width: 120px;">Round {r_inv.round}:</span>
          <span class="info-value" style="color: #4B5563; font-weight: bold; color: #7B1FA2;">{r_inv.score}/100</span>
        </div>
        """
    rounds_text = "\n".join(round_summaries)

    subject = f"Interview Round Completed: {interview.role}"
    body = f"""Dear {candidate.get_full_name() or "Candidate"},

Thank you for participating in the interview process for the position of '{interview.role}'.

We have completed the evaluations for your Round {interview.round} interview. Here is a summary of your average scores:

{rounds_text}

We will get back to you soon with the next steps.

Best regards,
South Point School Recruitment Team
"""

    intro_text = f"Thank you for participating in the interview process for the position of <strong>{interview.role}</strong>. We have completed the evaluations for your Round {interview.round} interview. Here is a summary of your average scores:"
    candidate_html = get_interview_email_html(
        title="Interview Round Completed",
        name=candidate.get_full_name() or "Candidate",
        round_num=interview.round,
        role=interview.role,
        candidate_name=interview.candidate_name,
        date=interview.date,
        time=formatted_time,
        mode=interview.mode,
        meeting_link=interview.meeting_link,
        intro_text=intro_text,
        completed_scores_html=completed_scores_html,
    )

    from django.core.mail import send_mail
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[candidate.email],
        fail_silently=False,
        html_message=candidate_html,
    )
    return f"Sent interview round completed email to candidate {candidate.email} for round {interview.round}"


@shared_task
def send_automated_interview_reminders():
    """
    Periodically checks for interviews scheduled to start in approximately 1 hour
    and sends reminder emails if they haven't been sent already.
    """
    from interviews.models import Interview
    from django.utils import timezone
    from django.db import transaction
    from datetime import datetime, timedelta

    # Get localized current time (in the active timezone, e.g. Asia/Kolkata)
    now_local = timezone.localtime(timezone.now())
    
    # Query scheduled interviews that haven't received a reminder yet
    # Filter by date being today or tomorrow to optimize database scanning
    today = now_local.date()
    tomorrow = today + timedelta(days=1)
    
    interviews_to_remind = []
    
    # Use select_for_update inside an atomic block to prevent concurrent beat/view runs
    # from triggering duplicate reminders. Conditional on engine to prevent SQLite test locks.
    from django.db import connection
    with transaction.atomic():
        queryset = Interview.objects.filter(
            status="Scheduled",
            reminder_sent_at__isnull=True,
            date__in=[today, tomorrow]
        )
        if connection.vendor != 'sqlite':
            queryset = queryset.select_for_update()
            
        for interview in queryset:
            if not interview.date or not interview.time:
                continue
                
            # Combine date and time to construct interview localized datetime
            interview_dt_naive = datetime.combine(interview.date, interview.time)
            interview_dt = timezone.make_aware(interview_dt_naive, timezone.get_current_timezone())
            
            # Calculate time difference
            time_diff = interview_dt - now_local
            
            # Check if starting in 50 to 75 minutes (representing 1 hour before, with timing tolerance)
            if timedelta(minutes=50) <= time_diff <= timedelta(minutes=75):
                # Double check that no other thread updated it just before lock acquisition
                if interview.reminder_sent_at is not None:
                    continue
                interview.reminder_sent_at = timezone.now()
                interview.save(update_fields=["reminder_sent_at"])
                interviews_to_remind.append(interview.id)
                
    # Send actual email reminder tasks outside of database locks/transactions
    # preventing slow SMTP actions from locking database rows
    sent_count = 0
    for interview_id in interviews_to_remind:
        try:
            send_interview_reminder_task(interview_id)
            sent_count += 1
        except Exception:
            pass
            
    return f"Automated check complete. Sent {sent_count} reminders."

