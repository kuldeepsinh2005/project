import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom'; // Import Navigate
import axios from 'axios';
import Starfield from '../components/Starfield.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth

// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function CreateMeetingPage() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- NEW: Authentication Check ---
  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a meeting title.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/meetings',
        { title },
        { withCredentials: true }
      );

      const meetingId = response.data?.data?.meetingId;

      if (meetingId) {
        navigate(`/test/video/${meetingId}`);
      } else {
        throw new Error('Could not retrieve meeting ID from the server response.');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Failed to create meeting. Please try again.';
      setError(errorMessage);
      console.error('Error creating meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Render loading state and redirect if not authenticated ---
  if (authLoading) {
    return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // --- END of NEW logic ---

  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex flex-col">
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
      
      {/* <Header /> */}

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Descriptive Text */}
            <div className="hidden lg:block space-y-6">
                <h1 className="text-5xl font-['Orbitron'] font-bold leading-tight">
                    Launch Your <span className="gradient-text">Next Collaboration</span>
                </h1>
                <p className="text-xl text-[#e2e8f0]/80 max-w-lg">
                    Simply give your meeting a name and instantly generate a secure room. Invite your team and start collaborating in seconds.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                    <div className="w-12 h-12 bg-[#1a2138] border border-[#6366f1]/20 rounded-full flex items-center justify-center">
                        <Icon id="users" className="text-[#6366f1] text-xl" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Seamless Invites</h4>
                        <p className="text-[#e2e8f0]/70">Share a simple code to bring everyone together.</p>
                    </div>
                </div>
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1a2138] border border-[#6366f1]/20 rounded-full flex items-center justify-center">
                        <Icon id="shield-alt" className="text-[#8b5cf6] text-xl" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Secure by Design</h4>
                        <p className="text-[#e2e8f0]/70">Every meeting is encrypted and private.</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Create Meeting Form */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="bg-[#1a2138]/80 backdrop-blur-md border border-[#6366f1]/20 p-8 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-['Orbitron'] font-bold text-white">
                        Create a <span className="gradient-text">New Meeting</span>
                        </h2>
                        <p className="text-[#e2e8f0]/70 mt-2">Give your meeting a title to get started.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded-lg mb-6 text-center">
                        {error}
                        </div>
                    )}

                    <form onSubmit={handleCreateMeeting} className="space-y-6">
                        <div className="relative">
                            <label htmlFor="meeting-title" className="sr-only">Meeting Title</label>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#8b5cf6]">
                                <Icon id="pencil-alt" />
                            </div>
                            <input
                                id="meeting-title"
                                name="title"
                                type="text"
                                autoComplete="off"
                                required
                                className="pl-12 pr-4 py-3 w-full bg-[#0a0e17]/70 border border-[#6366f1]/30 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                                placeholder="E.g., Termwork Project Sync"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center"
                        >
                            <Icon id="rocket" className="mr-2" />
                            {loading ? 'Creating...' : 'Launch Meeting'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
