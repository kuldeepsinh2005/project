import React, { useState } from "react";
import { useNavigate,Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login,isAuthenticated,loading } = useAuth(); // using login function from context
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (loading) {
    return <div>Loading...</div>; // Show a loader while checking auth
  }

  // If already logged in → redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const success = await login(form.email, form.password);
    console.log("Login success:", success);

    if (success) {
      navigate("/");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
