import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ HANDLE CHANGE
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ FIXED REGISTER FUNCTION
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ VERY IMPORTANT (prevents reload)
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", form);

      alert("Registration successful ✅");

      navigate("/"); // ✅ go to login
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Sign Up</h2>

      {/* ✅ FORM WRAPPED */}
      <form onSubmit={handleRegister}>
        
        <input
          name="first_name"
          placeholder="First Name"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="last_name"
          placeholder="Last Name"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="email"
          placeholder="Email"
          type="email"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <br /><br />

        {/* ✅ BUTTON FIXED */}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {/* ✅ ERROR DISPLAY */}
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      <p style={{ marginTop: "10px" }}>
        Already have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default RegisterPage;
