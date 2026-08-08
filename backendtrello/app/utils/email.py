import smtplib
from email.mime.text import MIMEText
from app.core.config import settings

SMTP_EMAIL = settings.SMTP_EMAIL
SMTP_PASSWORD = settings.SMTP_PASSWORD

def send_invite_email(to_email: str, link: str):
    msg = MIMEText(f"You are invited to join a team.\nClick here: {link}")
    msg["Subject"] = "Team Invitation"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)

        server.send_message(msg)
        server.quit()

        print("✅ Email sent to", to_email)

    except Exception as e:
        print("❌ Email failed:", e)
        

def send_otp(email, otp):
    msg = MIMEText(f"Your OTP is: {otp}")
    msg["Subject"] = "TaskFlow OTP Verification"
    msg["From"] = SMTP_EMAIL
    msg["To"] = email

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(SMTP_EMAIL, SMTP_PASSWORD)
    server.send_message(msg)
    server.quit()
    
def send_query_reply_email(
    to_email: str,
    reply: str
):
    msg = MIMEText(
        f"""
Hello,

Workivo Support has replied to your query.

Reply:
{reply}

Regards,
Workivo Team
"""
    )

    msg["Subject"] = "Workivo Support Reply"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)

        server.send_message(msg)
        server.quit()

        print("✅ Reply email sent")

    except Exception as e:
        print("❌ Reply email failed:", e)
