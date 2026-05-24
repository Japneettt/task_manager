import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
 
const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
 
  const state = location.state as any;
 
  const [otp, setOtp] = useState("");
 
  // ✅ VERIFY FUNCTION (SAFE + ERROR HANDLING)
  const verify = async () => {
    try {
      await api.post("/auth/verify-otp", {
        email: state.email,
        first_name: state.first_name,
        last_name: state.last_name,
        password: state.password,
        otp: otp,
      });
 
      alert("Account created ✅");
      navigate("/");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Verification failed");
    }
  };
 
  // ✅ RESEND FUNCTION (FIXED URL)
  const resend = async () => {
    try {
      await api.post("/auth/resend-otp", null, {
        params: { email: state.email },
      });
 
      alert("OTP resent ✅");
    } catch (err: any) {
      alert("Resend failed");
    }
  };
 
  // ✅ SAFETY CHECK (IMPORTANT)
  if (!state) {
    return <h3 style={{ textAlign: "center" }}>Invalid access</h3>;
  }
 
  return (
    <div style={box}>
      <h2>Verify OTP</h2>
 
      <p style={{ fontSize: "14px" }}>
        Enter OTP sent to <b>{state.email}</b>
      </p>
 
      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={input}
      />
 
      <button onClick={verify} style={button}>
        Verify
      </button>
 
      <button onClick={resend} style={resendBtn}>
        Resend OTP
      </button>
    </div>
  );
};
 
export default VerifyOtpPage;
 
const box: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "320px",
  margin: "100px auto",
  gap: "10px",
  textAlign: "center",
};
 
const input: React.CSSProperties = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
};
 
const button: React.CSSProperties = {
  padding: "10px",
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
 
const resendBtn: React.CSSProperties = {
  padding: "8px",
  background: "transparent",
  color: "#2563eb",
  border: "none",
  cursor: "pointer",
};