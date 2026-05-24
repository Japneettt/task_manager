from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifySchema(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str
    otp: str