import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: ""
  });

  const submit = async () => {
    if (form.password !== form.confirm_password) {
      alert("Passwords not matching");
      return;
    }

    try {
      // ✅ FIXED API PATH
      await api.post("/auth/register", form);

      navigate("/verify", { state: form });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={container}>

      {/* ✅ LEFT SIDE */}
      <div style={left}>
        <div style={{ padding: "40px", color: "white" }}>
          <h2 style={{ fontWeight: 600 }}>
            Build your workspace 🚀
          </h2>

          <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
            Collaborate with your team, manage tasks, and stay productive
            with TaskFlow.
          </p>
        </div>
      </div>

      {/* ✅ RIGHT SIDE */}
      <div style={right}>
        <div style={formBox}>

          <h3 style={{ fontWeight: 600 }}>Create Account</h3>

          <input
            placeholder="Email"
            style={input}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="First Name"
            style={input}
            onChange={e => setForm({ ...form, first_name: e.target.value })}
          />

          <input
            placeholder="Last Name"
            style={input}
            onChange={e => setForm({ ...form, last_name: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            style={input}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            style={input}
            onChange={e =>
              setForm({ ...form, confirm_password: e.target.value })
            }
          />

          <button style={button} onClick={submit}>
            Send OTP
          </button>

          <p style={{ marginTop: "10px", fontSize: "14px" }}>
            Already have an account?{" "}
            <span
              style={{ color: "#4f46e5", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

const container: React.CSSProperties = {
  display: "flex",
  height: "100vh"
};

const left: React.CSSProperties = {
  flex: 1,
  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage: "url('/team-collaboration.svg')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "bottom",
  backgroundSize: "70%"
};

const right: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff"
};

const formBox: React.CSSProperties = {
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const input: React.CSSProperties = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd"
};

const button: React.CSSProperties = {
  background: "linear-gradient(to right, #4f46e5, #2563eb)",
  color: "white",
  padding: "10px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};