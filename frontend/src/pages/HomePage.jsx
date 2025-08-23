import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Corrected import path
import Starfield from '../components/Starfield.jsx';
import axios from 'axios';
import Features from '../components/Features.jsx';
import CTA from '../sections/CTA.jsx';
import ExampleMeetingCard from '../components/ExampleMeetingCard.jsx';

// --- Reusable Icon Components ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, loading } = useAuth();
  
  // State for the "Join Meeting" input
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Handler for joining a meeting directly from the homepage
  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    if (!code.trim()) {
        setJoinError('Please enter a meeting code.');
        return;
    }
    setIsJoining(true);
    setJoinError('');
    try {
      const res = await axios.post(`http://localhost:5000/api/meetings/${code}/join`, {}, { withCredentials: true });
      if (res.data.success) {
        navigate(`/test/video/${res.data.meeting.code}`);
      } else {
        throw new Error(res.data.error || "Failed to join meeting");
      }
    } catch (err) {
      setJoinError(err.response?.data?.error || 'Invalid meeting code.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen">
      {/* Add Google Fonts and Font Awesome CDN */}
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
      <Starfield />

      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10">
            
            <h1 className="text-4xl md:text-5xl font-['Orbitron'] font-bold leading-tight">
              CONNECT ACROSS THE <span className="gradient-text">COSMOS</span>
            </h1>
            <p className="text-xl text-[#e2e8f0]/80 max-w-lg">
              Premium video meetings with stellar quality. Secure, reliable, and designed for the future of collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => isAuthenticated ? navigate('/test/createmeeting') : navigate('/login')} 
                className="px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-xl font-medium text-lg flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.7)] hover:-translate-y-1"
              >
                <Icon id="plus" className="mr-3" />New Meeting
              </button>
              
              <form onSubmit={handleJoinMeeting} className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#8b5cf6]">
                    <Icon id="key" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter meeting code" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength="6"
                    className="pl-12 pr-6 py-4 bg-[#1a2138]/70 border border-[#6366f1]/30 rounded-xl focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] w-full sm:w-64 backdrop-blur-sm"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isJoining}
                  className="px-8 py-4 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 rounded-xl font-medium text-lg flex items-center justify-center transition disabled:bg-sky-400"
                >
                  <Icon id="sign-in-alt" className="mr-3" />
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
              </form>
              
            </div>
             {joinError && <p className="text-red-400 text-sm mt-2">{joinError}</p>}

          </div>
          <div>
              <ExampleMeetingCard />
            </div>
        </div>
      </section>
      <Features/>
      <CTA />
    </div>
  );
}


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function Home() {
//   const navigate = useNavigate();
//   const { isAuthenticated, logout, user, loading } = useAuth();

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div style={{ padding: "20px" }}>
//       {!isAuthenticated ? (
//         <>
//           <h1>Welcome to CosmoMeet</h1>
//           <p>
//             Please{" "}
//             <span
//               style={{ color: "blue", cursor: "pointer" }}
//               onClick={() => navigate("/login")}
//             >
//               login
//             </span>{" "}
//             or{" "}
//             <span
//               style={{ color: "blue", cursor: "pointer" }}
//               onClick={() => navigate("/register")}
//             >
//               register
//             </span>{" "}
//             to continue.
//           </p>
//         </>
//       ) : (
//         <>
//           <h1 className="text-blue-400 mb-8" >Welcome Back {user?.name || "User"}!</h1>
//           <p>Choose an action below:</p>
//           <button onClick={() => navigate("/create-meeting")}>Create Meeting</button>
//           <button onClick={() => navigate("/join-meeting")}>Join Meeting</button>
//           <button onClick={() => navigate("/leave-meeting")}>Leave Meeting</button>
//           <button onClick={() => navigate("/end-meeting")}>End Meeting</button>
//           <button onClick={() => navigate("/remove-participant")}>Remove Participant</button>
//           <br />
//           <button onClick={logout} style={{ marginTop: "10px", color: "red" }}>
//             Logout
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
