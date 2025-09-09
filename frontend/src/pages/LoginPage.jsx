
import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Starfield from "../components/Starfield.jsx";

// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
        const success = await login(form.email, form.password);
        if (success) {
            navigate("/");
        } else {
            throw new Error("Invalid email or password");
        }
    } catch (err) {
        setError(err.message || "An unknown error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex items-center justify-center p-4">
      <Starfield />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        .gradient-text {
          background: linear-gradient(90deg, #8b5cf6, #6366f1, #0ea5e9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#1a2138]/80 backdrop-blur-md border border-[#6366f1]/20 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-['Orbitron'] font-bold text-white">
              Welcome Back to <span className="gradient-text">CosmoMeet</span>
            </h2>
            <p className="text-[#e2e8f0]/70 mt-2">Sign in to continue your journey.</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#8b5cf6]">
                <Icon id="envelope" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="pl-12 pr-4 py-3 w-full bg-[#0a0e17]/70 border border-[#6366f1]/30 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#8b5cf6]">
                <Icon id="lock" />
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="pl-12 pr-4 py-3 w-full bg-[#0a0e17]/70 border border-[#6366f1]/30 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center"
            >
              <Icon id="rocket" className="mr-2" />
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#e2e8f0]/60 mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-[#6366f1] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

