import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  LockKeyhole,
  ShieldCheck,
  KeyRound,
  Clock,
  Eye,
  EyeOff,
  Check,
  Lock,
} from "lucide-react";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One number", met: /[0-9]/.test(newPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const strengthLabel =
    newPassword.length === 0
      ? "Weak"
      : metCount <= 1
      ? "Weak"
      : metCount === 2
      ? "Fair"
      : metCount === 3
      ? "Good"
      : "Strong";
  const strengthSegments = newPassword.length === 0 ? 0 : Math.max(1, metCount);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      setStatus(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation must match.");
      setStatus(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      await api.put("/users/me/password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setStatus("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageShell">
      
{/* ✅ BACK BUTTON */}
    <button
      className="backBtn"
      onClick={() => navigate(-1)}
    >
      ←
    </button>

      <div className="leftPanel">
        <div className="leftTop">
          <div className="iconBadge">
            <LockKeyhole size={26} />
          </div>
          <h1>Change Password</h1>
          <p>
            Update your password regularly to keep your account secure and
            protected.
          </p>
        </div>

        <div className="infoList">
          <div className="infoItem">
            <div className="infoIcon">
              <ShieldCheck size={17} />
            </div>
            <div>
              <h3>Keep your account secure</h3>
              <p>
                A strong password helps protect your account from
                unauthorized access.
              </p>
            </div>
          </div>
          <div className="infoItem">
            <div className="infoIcon">
              <KeyRound size={17} />
            </div>
            <div>
              <h3>Password best practices</h3>
              <p>Use a combination of letters, numbers, and special characters.</p>
            </div>
          </div>
          <div className="infoItem">
            <div className="infoIcon">
              <Clock size={17} />
            </div>
            <div>
              <h3>Stay up to date</h3>
              <p>Changing your password regularly keeps your account protected.</p>
            </div>
          </div>
        </div>

        <div className="decorWrap" aria-hidden="true">
          <div className="decorGlow" />
          <LockKeyhole className="decorLock" size={56} />
        </div>
      </div>

      <div className="rightPanel">
        <div className="card">
          <div className="cardHeader">
            <h2>Update Your Password</h2>
            <p>Enter your current password and choose a new one.</p>
          </div>

          <div className="field">
            <label htmlFor="oldPassword">Current Password</label>
            <div className="inputWrap">
              <input
                id="oldPassword"
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowOld((s) => !s)}
                aria-label={showOld ? "Hide password" : "Show password"}
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="newPassword">New Password</label>
            <div className="inputWrap">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowNew((s) => !s)}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="strengthBar">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`seg ${i < strengthSegments ? "filled" : ""}`}
                />
              ))}
            </div>
            <p className="strengthLabel">
              Password strength: <span>{strengthLabel}</span>
            </p>

            <div className="requirements">
              <p className="reqTitle">Password must contain:</p>
              <div className="reqGrid">
                {requirements.map((r) => (
                  <div
                    className={`reqItem ${r.met ? "met" : ""}`}
                    key={r.label}
                  >
                    <span className="reqDot">{r.met && <Check size={11} />}</span>
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="inputWrap">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="formError">{error}</div>}
          {status && <div className="formSuccess">{status}</div>}

          <div className="cardFooter">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primaryBtn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        <div className="tipBanner">
          <div className="tipIcon">
            <Lock size={17} />
          </div>
          <div className="tipText">
            <p>
              <strong>Tip:</strong> Avoid using personal information or
              common words in your password.
            </p>
            
          </div>
          <LockKeyhole className="tipDecor" size={36} aria-hidden="true" />
        </div>
      </div>

      <style>{`
      * {
        box-sizing: border-box;
      }
      .pageShell {
        height: 100vh;
        width: 100%;
        display: flex;
        gap: clamp(20px, 3vw, 40px);
        padding: clamp(16px, 3vh, 32px) clamp(20px, 4vw, 48px);
        background: #f8fafc;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
        .backBtn {
  position: absolute;
  top: 20px;
  left: 24px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  transition: 0.2s;
}

.backBtn:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

      .leftPanel {
        flex: 0 0 36%;
        max-width: 420px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
        overflow: hidden;
      }
      .leftTop .iconBadge {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: linear-gradient(135deg, #ede9fe, #f3e8ff);
        color: #7c3aed;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;
      }
      .leftTop h1 {
        font-size: clamp(22px, 3vh, 30px);
        color: #0f172a;
        margin: 0 0 10px;
      }
      .leftTop p {
        font-size: 14px;
        color: #64748b;
        line-height: 1.55;
        margin: 0;
        max-width: 320px;
      }

      .infoList {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .infoItem {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding-bottom: 12px;
        border-bottom: 1px solid #eef2f7;
      }
      .infoItem:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .infoIcon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: #f3eeff;
        color: #7c3aed;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .infoItem h3 {
        font-size: 13.5px;
        color: #1e293b;
        margin: 0 0 2px;
      }
      .infoItem p {
        font-size: 12px;
        color: #64748b;
        margin: 0;
        line-height: 1.45;
      }

      .decorWrap {
        position: relative;
        height: clamp(70px, 14vh, 130px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .decorGlow {
        position: absolute;
        width: clamp(120px, 16vh, 180px);
        height: clamp(120px, 16vh, 180px);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(167,139,250,0.28), rgba(167,139,250,0) 70%);
      }
      .decorLock {
        position: relative;
        color: #a78bfa;
        opacity: 0.85;
      }

      .rightPanel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: clamp(10px, 1.6vh, 18px);
        min-width: 0;
        overflow: hidden;
      }

      .card {
        background: #ffffff;
        border: 1px solid #eef2f7;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
        padding: clamp(18px, 2.6vh, 28px);
        display: flex;
        flex-direction: column;
        gap: clamp(10px, 1.5vh, 14px);
        flex: 1;
        min-height: 0;
        overflow: auto;
      }

      .cardHeader h2 {
        margin: 0 0 4px;
        font-size: clamp(17px, 2.3vh, 21px);
        color: #0f172a;
      }
      .cardHeader p {
        margin: 0;
        color: #64748b;
        font-size: 13px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field label {
        font-size: 12.5px;
        font-weight: 600;
        color: #334155;
      }
      .inputWrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .inputWrap input {
        width: 100%;
        padding: 11px 40px 11px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
        color: #0f172a;
        font-size: 13.5px;
      }
      .inputWrap input:focus {
        outline: none;
        border-color: #a78bfa;
        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.25);
      }
      .eyeBtn {
        position: absolute;
        right: 10px;
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0;
      }

      .strengthBar {
        display: flex;
        gap: 6px;
        margin-top: 2px;
      }
      .seg {
        height: 5px;
        flex: 1;
        border-radius: 4px;
        background: #e2e8f0;
      }
      .seg.filled {
        background: linear-gradient(90deg, #7c3aed, #a855f7);
      }
      .strengthLabel {
        margin: 0;
        font-size: 12px;
        color: #64748b;
      }
      .strengthLabel span {
        color: #7c3aed;
        font-weight: 600;
      }

      .reqTitle {
        margin: 2px 0 6px;
        font-size: 12px;
        color: #475569;
        font-weight: 600;
      }
      .reqGrid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 14px;
      }
      .reqItem {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #94a3b8;
      }
      .reqItem.met {
        color: #334155;
      }
      .reqDot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1.5px solid #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #fff;
      }
      .reqItem.met .reqDot {
        background: #7c3aed;
        border-color: #7c3aed;
      }

      .formError {
        color: #b91c1c;
        font-size: 12.5px;
        background: #fef2f2;
        border-radius: 10px;
        padding: 8px 12px;
      }
      .formSuccess {
        color: #047857;
        font-size: 12.5px;
        background: #ecfdf5;
        border-radius: 10px;
        padding: 8px 12px;
      }

      .cardFooter {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px solid #f1f5f9;
      }
      .cancelBtn {
        padding: 10px 18px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        background: #fff;
        color: #334155;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
      }
      .cancelBtn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .primaryBtn {
        padding: 10px 20px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(90deg, #6366f1, #a855f7);
        color: #fff;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(99, 102, 241, 0.18);
        transition: transform 0.15s ease;
      }
      .primaryBtn:hover:not(:disabled) {
        transform: translateY(-1px);
      }
      .primaryBtn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .tipBanner {
        display: flex;
        align-items: center;
        gap: 14px;
        background: linear-gradient(120deg, #f5f3ff, #faf5ff);
        border-radius: 16px;
        padding: clamp(10px, 1.6vh, 16px) 18px;
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
      }
      .tipIcon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: #ffffff;
        color: #7c3aed;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tipText {
        min-width: 0;
      }
      .tipText p {
        margin: 0;
        font-size: 12px;
        color: #475569;
        line-height: 1.5;
      }
      .tipText a {
        color: #7c3aed;
        font-weight: 600;
        text-decoration: none;
      }
      .tipDecor {
        position: absolute;
        right: 16px;
        color: #ddd6fe;
        flex-shrink: 0;
      }

      @media (max-width: 900px) {
        .pageShell {
          height: auto;
          overflow: auto;
          flex-direction: column;
        }
        .leftPanel {
          flex: none;
          max-width: none;
        }
        .decorWrap {
          display: none;
        }
      }
      `}</style>
    </div>
  );
};

export default ChangePasswordPage;
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../services/api";
 
// const ChangePasswordPage = () => {
//   const navigate = useNavigate();
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [status, setStatus] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
 
//   const handleSubmit = async () => {
//     if (!oldPassword || !newPassword || !confirmPassword) {
//       setError("Please fill out all fields.");
//       setStatus(null);
//       return;
//     }
 
//     if (newPassword !== confirmPassword) {
//       setError("New password and confirmation must match.");
//       setStatus(null);
//       return;
//     }
 
//     setLoading(true);
//     setError(null);
//     setStatus(null);
 
//     try {
//       await api.put("/users/me/password", {
//         old_password: oldPassword,
//         new_password: newPassword,
//       });
//       setStatus("Password updated successfully.");
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     } catch (err: any) {
//       setError(err?.response?.data?.detail || "Unable to update password.");
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   return (
//     <div className="pageShell">
//       <div className="pageHeader">
//         <button className="backBtn" onClick={() => navigate(-1)}>
//           ← Back
//         </button>
//         <h2>Change Password</h2>
//       </div>
 
//       <div className="contentCard">
//         <p className="helpText">
//           Use this form to securely update your account password.
//         </p>
 
//         <div className="formGrid">
//           <label>
//             Current Password
//             <input
//               type="password"
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               placeholder="Enter current password"
//             />
//           </label>
 
//           <label>
//             New Password
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               placeholder="Enter new password"
//             />
//           </label>
 
//           <label>
//             Confirm New Password
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm new password"
//             />
//           </label>
//         </div>
 
//         {error && <div className="formError">{error}</div>}
//         {status && <div className="formSuccess">{status}</div>}
 
//         <button className="primaryBtn" onClick={handleSubmit} disabled={loading}>
//           {loading ? "Updating..." : "Update Password"}
//         </button>
//       </div>
 
//       <style>{`
//       .pageShell {
//         padding: 24px;
//         background: #f8fafc;
//         min-height: 100vh;
//       }
//       .pageHeader {
//         display: flex;
//         align-items: center;
//         justify-content: space-between;
//         gap: 16px;
//         margin-bottom: 24px;
//         flex-wrap: wrap;
//       }
//       .backBtn {
//         border: none;
//         background: transparent;
//         font-size: 14px;
//         color: #4f46e5;
//         cursor: pointer;
//       }
//       .contentCard {
//         max-width: 560px;
//         background: #ffffff;
//         border: 1px solid rgba(226,232,240,1);
//         border-radius: 24px;
//         box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
//         padding: 28px;
//       }
//       .helpText {
//         color: #475569;
//         margin-bottom: 20px;
//       }
//       .formGrid {
//         display: grid;
//         gap: 16px;
//         margin-bottom: 20px;
//       }
//       label {
//         display: grid;
//         gap: 8px;
//         color: #334155;
//         font-weight: 600;
//       }
//       input {
//         width: 100%;
//         border: 1px solid rgba(226,232,240,1);
//         border-radius: 16px;
//         padding: 14px 16px;
//         background: #f8fafc;
//         color: #0f172a;
//       }
//       .formError {
//         color: #b91c1c;
//         margin-bottom: 12px;
//       }
//       .formSuccess {
//         color: #047857;
//         margin-bottom: 12px;
//       }
//       .primaryBtn {
//         width: 100%;
//         padding: 14px 16px;
//         border: none;
//         border-radius: 16px;
//         background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
//         color: white;
//         font-weight: 700;
//         cursor: pointer;
//         box-shadow: 0 14px 30px rgba(99, 102, 241, 0.18);
//         transition: transform 0.2s ease, box-shadow 0.2s ease;
//       }
//       .primaryBtn:hover:not(:disabled) {
//         transform: translateY(-1px);
//       }
//       .primaryBtn:disabled {
//         opacity: 0.65;
//         cursor: not-allowed;
//       }
//       `}</style>
//     </div>
//   );
// };
 
// export default ChangePasswordPage;