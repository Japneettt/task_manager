import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      <div className="pageHeader">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Change Password</h2>
      </div>

      <div className="contentCard">
        <p className="helpText">
          Use this form to securely update your account password.
        </p>

        <div className="formGrid">
          <label>
            Current Password
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </label>

          <label>
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </label>
        </div>

        {error && <div className="formError">{error}</div>}
        {status && <div className="formSuccess">{status}</div>}

        <button className="primaryBtn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>

      <style>{`
      .pageShell {
        padding: 24px;
        background: #f8fafc;
        min-height: 100vh;
      }
      .pageHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .backBtn {
        border: none;
        background: transparent;
        font-size: 14px;
        color: #4f46e5;
        cursor: pointer;
      }
      .contentCard {
        max-width: 560px;
        background: #ffffff;
        border: 1px solid rgba(226,232,240,1);
        border-radius: 24px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
        padding: 28px;
      }
      .helpText {
        color: #475569;
        margin-bottom: 20px;
      }
      .formGrid {
        display: grid;
        gap: 16px;
        margin-bottom: 20px;
      }
      label {
        display: grid;
        gap: 8px;
        color: #334155;
        font-weight: 600;
      }
      input {
        width: 100%;
        border: 1px solid rgba(226,232,240,1);
        border-radius: 16px;
        padding: 14px 16px;
        background: #f8fafc;
        color: #0f172a;
      }
      .formError {
        color: #b91c1c;
        margin-bottom: 12px;
      }
      .formSuccess {
        color: #047857;
        margin-bottom: 12px;
      }
      .primaryBtn {
        width: 100%;
        padding: 14px 16px;
        border: none;
        border-radius: 16px;
        background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
        color: white;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 14px 30px rgba(99, 102, 241, 0.18);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .primaryBtn:hover:not(:disabled) {
        transform: translateY(-1px);
      }
      .primaryBtn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      `}</style>
    </div>
  );
};

export default ChangePasswordPage;
