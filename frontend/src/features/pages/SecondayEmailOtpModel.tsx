import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

interface SecondaryEmailOtpModalProps {
  email: string;
  onClose: () => void;
  onVerified: (updatedUser: any) => void;
}

const RESEND_SECONDS = 30;

const SecondaryEmailOtpModal = ({ email, onClose, onVerified }: SecondaryEmailOtpModalProps) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < 6) next.push("");
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputsRef.current[lastFilled]?.focus();
  };

  const verify = async () => {
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const res = await api.post("/users/verify-secondary-otp", { email, otp });
      setSuccess(true);
      setTimeout(() => {
        onVerified(res.data);
      }, 900);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid OTP, please try again");
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    }

    setVerifying(false);
  };

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      await api.post("/users/send-secondary-otp", { email });
      setSecondsLeft(RESEND_SECONDS);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to resend OTP");
    }
    setResending(false);
  };

  return (
    <div className="otpOverlay" onClick={onClose}>
      <div className="otpModal" onClick={(e) => e.stopPropagation()}>
        <button className="otpCloseBtn" onClick={onClose}>✕</button>

        {success ? (
          <div className="otpSuccess">
            <div className="otpCheckCircle">✓</div>
            <h3>Email Verified</h3>
            <p>{email} is now your verified secondary email.</p>
          </div>
        ) : (
          <>
            <div className="otpIconCircle">📧</div>
            <h3>Verify your email</h3>
            <p className="otpSubtext">
              Enter the 6-digit code sent to<br />
              <b>{email}</b>
            </p>

            <div className={`otpBoxes ${error ? "otpShake" : ""}`}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
  inputsRef.current[i] = el;
}}
                  value={d}
                  maxLength={1}
                  inputMode="numeric"
                  className="otpBox"
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            {error && <p className="otpError">{error}</p>}

            <button className="otpVerifyBtn" onClick={verify} disabled={verifying}>
              {verifying ? "Verifying..." : "Verify Email"}
            </button>

            <p className="otpResendText">
              {secondsLeft > 0 ? (
                <>Resend code in {secondsLeft}s</>
              ) : (
                <span className="otpResendLink" onClick={resending ? undefined : resend}>
                  {resending ? "Resending..." : "Resend Code"}
                </span>
              )}
            </p>
          </>
        )}
      </div>

      <style>{`
        .otpOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: otpFadeIn 0.2s ease;
        }

        .otpModal {
          position: relative;
          width: 380px;
          max-width: 90vw;
          background: white;
          border-radius: 20px;
          padding: 36px 30px 30px;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25);
          animation: otpPopIn 0.25s ease;
        }

        .otpCloseBtn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: #f1f5f9;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          color: #64748b;
          font-size: 14px;
        }

        .otpIconCircle {
          width: 56px;
          height: 56px;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: linear-gradient(135deg,#6366f1,#3b82f6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .otpModal h3 {
          margin: 0 0 6px;
          color: #1e293b;
        }

        .otpSubtext {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 22px;
          line-height: 1.5;
        }

        .otpBoxes {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 14px;
        }

        .otpBox {
          width: 44px;
          height: 52px;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          border-radius: 10px;
          border: 1.5px solid #d1d5db;
          outline: none;
          transition: 0.2s;
        }

        .otpBox:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
        }

        .otpShake {
          animation: otpShakeAnim 0.4s;
        }

        .otpError {
          color: #ef4444;
          font-size: 13px;
          margin: 0 0 14px;
        }

        .otpVerifyBtn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg,#6366f1,#3b82f6);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .otpVerifyBtn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .otpVerifyBtn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.35);
        }

        .otpResendText {
          margin-top: 16px;
          font-size: 13px;
          color: #94a3b8;
        }

        .otpResendLink {
          color: #6366f1;
          cursor: pointer;
          font-weight: 600;
        }

        .otpSuccess {
          padding: 10px 0 4px;
        }

        .otpCheckCircle {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: linear-gradient(135deg,#22c55e,#16a34a);
          color: white;
          font-size: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: otpPopIn 0.3s ease;
        }

        .otpSuccess h3 { margin-bottom: 6px; }
        .otpSuccess p { font-size: 13px; color: #64748b; }

        @keyframes otpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes otpPopIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes otpShakeAnim {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default SecondaryEmailOtpModal;