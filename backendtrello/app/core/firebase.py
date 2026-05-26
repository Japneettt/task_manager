import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("trelloclone-5bcc6-firebase-adminsdk-fbsvc-a3506677e7.json")
firebase_admin.initialize_app(cred)

def verify_firebase_token(token: str):
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        return None