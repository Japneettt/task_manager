import smtplib
from email.mime.text import MIMEText
 
SMTP_EMAIL = "babita2000rana@gmail.com"
SMTP_PASSWORD = "neda axmw xayj iqlj"
 
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