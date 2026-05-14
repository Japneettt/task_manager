import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api"; // ✅ important

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", form);

      alert("Registration successful ✅");
      navigate("/"); // ✅ go to login
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Sign Up</h2>

      <input
        name="first_name"
        placeholder="First Name"
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="last_name"
        placeholder="Last Name"
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <br /><br />

      <button onClick={handleRegister}>Register</button>

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