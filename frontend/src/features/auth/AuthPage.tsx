import { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api"; // ✅ important
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../services/firebase";
const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const navigate = useNavigate();
 
 
  // ✅ LOGIN HANDLER (REAL API)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
 
    setLoading(true);
    setError("");
 
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
 
      // ✅ store JWT token
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("isLoggedIn", "true");
 
      // ✅ redirect
      navigate("/dashboard");
 
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
 
      const token = await result.user.getIdToken();
 
      const res = await api.post("/auth/google", {
        token,
      });
 
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("isLoggedIn", "true");
 
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login failed", err);
    }
  };
 
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Container fluid className="p-0" style={{ height: "100%" }}>
        <Row className="g-0" style={{ height: "100%" }}>
 
          {/* ✅ LEFT SIDE */}
          <Col
            md={5}
            className="d-flex align-items-center justify-content-center"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div style={{ width: "100%", maxWidth: "360px" }}>
 
              {/* ✅ LOGO */}
              <div className="mb-4">
                <img
                  src="/logo.png"
                  alt="logo"
                  style={{ width: "35px", marginBottom: "10px" }}
                />
                <h4 style={{ fontWeight: 600 }}>TaskFlow</h4>
              </div>
 
              {/* ✅ TITLE */}
              <h5 style={{ fontWeight: 600 }}>Welcome back 👋</h5>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Log in to continue to your workspace
              </p>
 
              {/* ✅ ERROR MESSAGE */}
              {error && <Alert variant="danger">{error}</Alert>}
 
              {/* ✅ FORM */}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
 
                <Form.Group className="mb-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
 
                <div className="d-flex justify-content-between mb-3">
                  <Form.Check type="checkbox" label="Remember me" />
                  <span
                    style={{
                      color: "#2563eb",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Forgot password?
                  </span>
                </div>
 
                {/* ✅ BUTTON */}
                <Button
                  type="submit"
                  className="w-100"
                  disabled={loading}
                  style={{
                    background:
                      "linear-gradient(to right, #4f46e5, #2563eb)",
                    border: "none",
                    padding: "10px",
                    fontWeight: 500,
                  }}
                >
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </Form>
 
 
              {/* ✅ GOOGLE LOGIN BUTTON */}
              <Button
                onClick={handleGoogleLogin}
                style={{
                  marginTop: "10px",
                  background: "#ffffff",
                  color: "#000",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              >
                Continue with Google
              </Button>
 
 
              <Button
  onClick={async () => {
    try {
      const res = await api.post("/auth/admin/login", {
        email,
        password,
      });
 
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("isAdmin", "true");
 
      navigate("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Admin login failed");
    }
  }}
  style={{
    marginTop: "10px",
    width: "100%",
    background: "black",
    color: "#00f0ff",
    border: "1px solid #00f0ff",
  }}
>
  🔐 Login as Admin
</Button>
 
 
              {/* ✅ FOOTER */}
              <div className="text-center mt-4">
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  Don’t have an account?
                </span>
                <span
                  onClick={() => navigate("/register")}
                  style={{
                    marginLeft: "5px",
                    color: "#2563eb",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Sign up
                </span>
              </div>
 
            </div>
          </Col>
 
          {/* ✅ RIGHT SIDE IMAGE */}
          <Col md={7} className="d-none d-md-block">
            <div
              style={{
                height: "100%",
                width: "100%",
                backgroundImage: "url('/right-illustration.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "#eef2ff",
                filter: "brightness(0.95)",
              }}
            />
          </Col>
 
        </Row>
      </Container>
    </div>
  );
};
 
export default AuthPage;
 
 
