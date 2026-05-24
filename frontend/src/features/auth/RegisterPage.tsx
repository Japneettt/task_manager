import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      });

      setSuccess("OTP sent to your email. Please verify to complete registration.");
      navigate("/verify", {
        state: { email, first_name: firstName, last_name: lastName, password },
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flex: 1, padding: "40px", maxWidth: "480px", margin: "auto" }}>
          <h2>Create your account</h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Sign up to start managing your tasks and teams.
          </p>

          {error && <div style={{ marginBottom: "16px", color: "#b91c1c" }}>{error}</div>}
          {success && <div style={{ marginBottom: "16px", color: "#166534" }}>{success}</div>}

          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={input}
            />
            <input
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={input}
            />
            <input
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={input}
            />
            <button type="submit" disabled={loading} style={button}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
            Already have an account? <span style={link} onClick={() => navigate("/login")}>Log in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const button: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const link: React.CSSProperties = {
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};
