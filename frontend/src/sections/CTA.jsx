import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function CTASection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Navigate to the dashboard if logged in, otherwise to the login page
  const handleLaunchMeeting = () => {
    if (isAuthenticated) {
      navigate('/test/createmeeting');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto relative p-1 rounded-2xl">
        {/* Animated Gradient Border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#0ea5e9] rounded-2xl blur opacity-75 animate-pulse"></div>
        
        {/* Main Content */}
        <div className="relative bg-[#1a2138]/80 backdrop-blur-xl p-10 rounded-2xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-4 text-white">READY TO EXPLORE THE COSMOS?</h2>
            <p className="text-xl text-[#e2e8f0]/80 mb-8 max-w-2xl mx-auto">
              Join thousands of teams across the universe who are revolutionizing their collaboration with CosmoMeet.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleLaunchMeeting}
                className="px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-xl font-medium text-lg text-white hover:opacity-90 transition flex items-center justify-center"
              >
                <Icon id="rocket" className="mr-3" />Launch Free Meeting
              </button>
              <button className="px-8 py-4 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 rounded-xl font-medium text-lg text-white transition flex items-center justify-center">
                <Icon id="crown" className="mr-3" />Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
