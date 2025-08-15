import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate,Navigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, login,isAuthenticated,loading } = useAuth();
  const navigate = useNavigate();

  
  if (loading) {
    return <div>Loading...</div>; // Show a loader while checking auth
  }

  // If already logged in → redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const success = await register(
        form.firstName,
        form.lastName,
        form.username,
        form.email,
        form.password
      );

      if (!success) {
        setError("Registration failed");
        return;
      }

      setMessage("Registration successful!");

      // ✅ Auto login after registration
      const loginSuccess = await login(form.email, form.password);
      if (loginSuccess) {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Register</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "inline-block", textAlign: "left" }}
      >
        <div>
          <label>First Name:</label>
          <br />
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <br />
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <br />
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <br />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <br />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Register
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
