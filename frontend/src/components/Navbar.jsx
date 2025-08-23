import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Reusable Icon Components ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-[#1a2138] py-4 px-6 border-b border-[#6366f1]/20 sticky top-0 z-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        .gradient-text {
          background: linear-gradient(90deg, #8b5cf6, #6366f1, #0ea5e9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}</style>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and Brand Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="hexagon w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <Icon id="video" className="text-white text-lg" />
          </div>
          <h1 className="text-2xl text-white font-['Orbitron'] font-bold">
            COSMO<span className="gradient-text">MEET</span>
          </h1>
        </div>

        {/* Navigation Links - Text color changed to white */}
        <div className="hidden md:flex space-x-6 text-white">
            <a href="/" className="hover:text-[#0ea5e9] transition">Home</a>
            <a href="/test/createmeeting" className="hover:text-[#0ea5e9] transition">New Meeting</a>
            <a href="join-meeting" className="hover:text-[#0ea5e9] transition">Join</a>
            <a href="#" className="hover:text-[#0ea5e9] transition">Support</a>
        </div>

        {/* Authentication Buttons */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:block text-white">Welcome, {user?.username}</span>
              <button onClick={logout} className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 transition text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg text-sm hover:bg-[#0a0e17] transition text-white">
                <Icon id="user-astronaut" className="mr-2" />Sign In
              </button>
              <button onClick={() => navigate('/register')} className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg text-sm hover:opacity-90 transition text-white">
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
