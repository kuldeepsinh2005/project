import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Starfield from "../components/Starfield";

// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function RegisterPage() {
  const { register, login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
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
      const success = await register(
        form.firstName,
        form.lastName,
        form.username,
        form.email,
        form.password
      );

      if (!success) {
        throw new Error("Registration failed. Username or email may already exist.");
      }

      // Auto-login after successful registration
      const loginSuccess = await login(form.email, form.password);
      if (loginSuccess) {
        navigate("/");
      } else {
        // This case is unlikely but handled for robustness
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Something went wrong during registration.");
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
              Join the <span className="gradient-text">Cosmos</span>
            </h2>
            <p className="text-[#e2e8f0]/70 mt-2">Create your account to start meeting.</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <InputWithIcon icon="user" type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
                <InputWithIcon icon="user" type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
            </div>
            <InputWithIcon icon="user-astronaut" type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
            <InputWithIcon icon="envelope" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email Address" required />
            <InputWithIcon icon="lock" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center"
            >
              <Icon id="user-plus" className="mr-2" />
              {isSubmitting ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#e2e8f0]/60 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#6366f1] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component for input fields to reduce repetition
const InputWithIcon = ({ icon, ...props }) => (
    <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#8b5cf6]">
            <Icon id={icon} />
        </div>
        <input
            {...props}
            className="pl-12 pr-4 py-3 w-full bg-[#0a0e17]/70 border border-[#6366f1]/30 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
        />
    </div>
);
