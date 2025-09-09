import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
// import Header from '../components/Header.jsx';
// import Footer from '../components/Footer.jsx';
import Starfield from '../components/Starfield.jsx';

const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// --- Meeting Detail Modal (Updated) ---
const MeetingDetailModal = ({ meeting, onClose, user }) => {
    if (!meeting) return null;

    // No longer filtering for active participants
    const allParticipants = meeting.participants;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2138] border border-[#6366f1]/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-[#6366f1]/20 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white truncate">{meeting.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon id="times" className="text-2xl" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-[#e2e8f0]/70">Meeting Code</p>
                            <p className="font-mono text-white bg-[#0a0e17] px-2 py-1 rounded w-min">{meeting.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[#e2e8f0]/70">Status</p>
                            <p className={`font-bold uppercase ${meeting.status === 'live' ? 'text-green-400' : 'text-red-400'}`}>{meeting.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[#e2e8f0]/70">Date Created</p>
                            <p className="text-white">{new Date(meeting.createdAt).toLocaleString()}</p>
                        </div>
                         <div>
                            <p className="text-sm text-[#e2e8f0]/70">Host</p>
                            <p className="text-white">{meeting.host.username}</p>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 border-t border-[#6366f1]/20 pt-3">
                        Participant History ({allParticipants.length})
                    </h3>
                    <ul className="space-y-3">
                        {allParticipants.map((p) => (
                            <li key={p.user._id} className="bg-[#0a0e17]/50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Icon id="user-circle" className="w-5 h-5 mr-3 text-[#e2e8f0]/70" />
                                        <span className="font-medium text-sm">{p.user.username}</span>
                                    </div>
                                    {p.user._id === meeting.host._id && <span className="text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/20 px-1.5 py-0.5 rounded-full">Host</span>}
                                </div>
                                <div className="text-xs text-[#e2e8f0]/60 mt-2 pl-8 border-l border-gray-700 ml-2.5">
                                    <p><strong>Joined:</strong> {new Date(p.joinedAt).toLocaleString()}</p>
                                    <p><strong>Left:</strong> {p.leavedAt ? new Date(p.leavedAt).toLocaleString() : <span className="text-green-400">Still Active</span>}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


export default function MyMeetingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await axios.get('http://localhost:5000/api/meetings/my-meetings', { withCredentials: true });
        if (res.data.success) {
          setMeetings(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch meeting history.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchMeetings();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hostedMeetings = meetings.filter(m => m.host._id === user._id);
  const participatedMeetings = meetings.filter(m => m.host._id !== user._id);

  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex flex-col">
      <Starfield />
      {/* <Header /> */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-['Orbitron'] font-bold text-white mb-8">My Meeting History</h1>
          
          {loading ? (
            <p>Loading your meetings...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : meetings.length === 0 ? (
             <div className="text-center bg-[#1a2138]/60 p-8 rounded-2xl">
              <Icon id="history" className="text-4xl text-[#6366f1] mb-4" />
              <h2 className="text-2xl font-bold">No Meetings Yet</h2>
              <p className="text-[#e2e8f0]/70 mt-2">You haven't hosted or joined any meetings. <br/> Start by creating one from your dashboard!</p>
              <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg text-white font-semibold">Go to Dashboard</button>
            </div>
          ) : (
            <div className="space-y-10">
                {/* Hosted Meetings Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#8b5cf6] pb-2">Hosted by You</h2>
                    {hostedMeetings.length > 0 ? (
                        <div className="space-y-4">
                            {hostedMeetings.map((meeting) => (
                                <MeetingRow key={meeting._id} meeting={meeting} onSelect={setSelectedMeeting} />
                            ))}
                        </div>
                    ) : <p className="text-[#e2e8f0]/70">You have not hosted any meetings.</p>}
                </div>

                {/* Participated Meetings Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#0ea5e9] pb-2">Participated In</h2>
                     {participatedMeetings.length > 0 ? (
                        <div className="space-y-4">
                            {participatedMeetings.map((meeting) => (
                                <MeetingRow key={meeting._id} meeting={meeting} onSelect={setSelectedMeeting} />
                            ))}
                        </div>
                    ) : <p className="text-[#e2e8f0]/70">You have not participated in any meetings.</p>}
                </div>
            </div>
          )}
        </div>
      </main>
      {/* <Footer /> */}
      <MeetingDetailModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} user={user} />
    </div>
  );
}

// --- Reusable Meeting Row Component ---
const MeetingRow = ({ meeting, onSelect }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-[#1a2138]/80 backdrop-blur-md border border-[#6366f1]/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1 cursor-pointer" onClick={() => onSelect(meeting)}>
                <h3 className="font-bold text-lg text-white hover:underline">{meeting.title}</h3>
                <p className="text-sm text-[#e2e8f0]/70">Code: <span className="font-mono">{meeting.code}</span></p>
                <p className="text-xs text-[#e2e8f0]/50">Hosted by: {meeting.host.username}</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold">{new Date(meeting.createdAt).toLocaleDateString()}</p>
                <p className={`text-xs font-bold uppercase ${meeting.status === 'live' ? 'text-green-400' : 'text-red-400'}`}>{meeting.status}</p>
            </div>
            <button 
                onClick={() => {}} 
                disabled={meeting.status === 'ended'}
                className="px-6 py-2 rounded-lg bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold transition"
            >
                {meeting.status === 'ended' ? 'Ended' : 'Rejoin'}
            </button>
        </div>
    );
};


// import React, { useState, useEffect } from 'react';
// import { useNavigate, Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
// // import Header from '../components/Header';
// // import Footer from '../components/Footer';
// import Starfield from '../components/Starfield';

// const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// // --- Meeting Detail Modal ---
// const MeetingDetailModal = ({ meeting, onClose, user }) => {
//     if (!meeting) return null;

//     const activeParticipants = meeting.participants.filter(p => !p.leavedAt);

//     return (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//             <div className="bg-[#1a2138] border border-[#6366f1]/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
//                 <div className="p-4 border-b border-[#6366f1]/20 flex justify-between items-center">
//                     <h2 className="text-xl font-bold text-white truncate">{meeting.title}</h2>
//                     <button onClick={onClose} className="text-gray-400 hover:text-white">
//                         <Icon id="times" className="text-2xl" />
//                     </button>
//                 </div>
//                 <div className="p-6 overflow-y-auto">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                         <div>
//                             <p className="text-sm text-[#e2e8f0]/70">Meeting Code</p>
//                             <p className="font-mono text-white bg-[#0a0e17] px-2 py-1 rounded w-min">{meeting.code}</p>
//                         </div>
//                         <div>
//                             <p className="text-sm text-[#e2e8f0]/70">Status</p>
//                             <p className={`font-bold uppercase ${meeting.status === 'live' ? 'text-green-400' : 'text-red-400'}`}>{meeting.status}</p>
//                         </div>
//                         <div>
//                             <p className="text-sm text-[#e2e8f0]/70">Date Created</p>
//                             <p className="text-white">{new Date(meeting.createdAt).toLocaleString()}</p>
//                         </div>
//                          <div>
//                             <p className="text-sm text-[#e2e8f0]/70">Host</p>
//                             <p className="text-white">{meeting.host.username}</p>
//                         </div>
//                     </div>
                    
//                     <h3 className="text-lg font-bold mb-3 border-t border-[#6366f1]/20 pt-3">
//                         Active Participants ({activeParticipants.length})
//                     </h3>
//                     <ul className="space-y-2">
//                         {activeParticipants.map((p) => (
//                             <li key={p.user._id} className="flex items-center bg-[#0a0e17]/50 p-2 rounded-lg">
//                                 <Icon id="user-circle" className="w-5 h-5 mr-3 text-[#e2e8f0]/70" />
//                                 <span className="font-medium text-sm">{p.user.username}</span>
//                                 {p.user._id === meeting.host._id && <span className="ml-auto text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/20 px-1.5 py-0.5 rounded-full">Host</span>}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };


// export default function MyMeetingsPage() {
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [meetings, setMeetings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedMeeting, setSelectedMeeting] = useState(null);

//   useEffect(() => {
//     const fetchMeetings = async () => {
//       if (!isAuthenticated) return;
//       try {
//         const res = await axios.get('http://localhost:5000/api/meetings/my-meetings', { withCredentials: true });
//         if (res.data.success) {
//           setMeetings(res.data.data);
//         }
//       } catch (err) {
//         setError('Failed to fetch meeting history.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (!authLoading) {
//       fetchMeetings();
//     }
//   }, [isAuthenticated, authLoading]);

//   if (authLoading) {
//     return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading...</div>;
//   }
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   const hostedMeetings = meetings.filter(m => m.host._id === user._id);
//   const participatedMeetings = meetings.filter(m => m.host._id !== user._id);

//   return (
//     <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex flex-col">
//       <Starfield />
//       {/* <Header /> */}
//       <main className="flex-grow p-4 sm:p-6 lg:p-8 relative z-10">
//         <div className="max-w-5xl mx-auto">
//           <h1 className="text-3xl sm:text-4xl font-['Orbitron'] font-bold text-white mb-8">My Meeting History</h1>
          
//           {loading ? (
//             <p>Loading your meetings...</p>
//           ) : error ? (
//             <p className="text-red-400">{error}</p>
//           ) : meetings.length === 0 ? (
//              <div className="text-center bg-[#1a2138]/60 p-8 rounded-2xl">
//               <Icon id="history" className="text-4xl text-[#6366f1] mb-4" />
//               <h2 className="text-2xl font-bold">No Meetings Yet</h2>
//               <p className="text-[#e2e8f0]/70 mt-2">You haven't hosted or joined any meetings. <br/> Start by creating one from your dashboard!</p>
//               <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg text-white font-semibold">Go to Dashboard</button>
//             </div>
//           ) : (
//             <div className="space-y-10">
//                 {/* Hosted Meetings Section */}
//                 <div>
//                     <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#8b5cf6] pb-2">Hosted by You</h2>
//                     {hostedMeetings.length > 0 ? (
//                         <div className="space-y-4">
//                             {hostedMeetings.map((meeting) => (
//                                 <MeetingRow key={meeting._id} meeting={meeting} onSelect={setSelectedMeeting} />
//                             ))}
//                         </div>
//                     ) : <p className="text-[#e2e8f0]/70">You have not hosted any meetings.</p>}
//                 </div>

//                 {/* Participated Meetings Section */}
//                 <div>
//                     <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#0ea5e9] pb-2">Participated In</h2>
//                      {participatedMeetings.length > 0 ? (
//                         <div className="space-y-4">
//                             {participatedMeetings.map((meeting) => (
//                                 <MeetingRow key={meeting._id} meeting={meeting} onSelect={setSelectedMeeting} />
//                             ))}
//                         </div>
//                     ) : <p className="text-[#e2e8f0]/70">You have not participated in any meetings.</p>}
//                 </div>
//             </div>
//           )}
//         </div>
//       </main>
//       {/* <Footer /> */}
//       <MeetingDetailModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} user={user} />
//     </div>
//   );
// }

// // --- Reusable Meeting Row Component ---
// const MeetingRow = ({ meeting, onSelect }) => {
//     const navigate = useNavigate();
//     return (
//         <div className="bg-[#1a2138]/80 backdrop-blur-md border border-[#6366f1]/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
//             <div className="flex-1 cursor-pointer" onClick={() => onSelect(meeting)}>
//                 <h3 className="font-bold text-lg text-white hover:underline">{meeting.title}</h3>
//                 <p className="text-sm text-[#e2e8f0]/70">Code: <span className="font-mono">{meeting.code}</span></p>
//                 <p className="text-xs text-[#e2e8f0]/50">Hosted by: {meeting.host.username}</p>
//             </div>
//             <div className="text-center">
//                 <p className="text-sm font-semibold">{new Date(meeting.createdAt).toLocaleDateString()}</p>
//                 <p className={`text-xs font-bold uppercase ${meeting.status === 'live' ? 'text-green-400' : 'text-red-400'}`}>{meeting.status}</p>
//             </div>
//             <button 
//                 onClick={() => navigate(`/meeting/${meeting.code}`)} 
//                 disabled={meeting.status === 'ended'}
//                 className="px-6 py-2 rounded-lg bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold transition"
//             >
//                 {meeting.status === 'ended' ? 'Ended' : 'Rejoin'}
//             </button>
//         </div>
//     );
// };


// import React, { useState, useEffect } from 'react';
// import { useNavigate, Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext.jsx';
// import axios from 'axios';
// // import Header from '../components/Header.jsx';
// // import Footer from '../components/Footer.jsx';
// import Starfield from '../components/Starfield.jsx';

// const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// export default function MyMeetingsPage() {
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [meetings, setMeetings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchMeetings = async () => {
//       if (!isAuthenticated) return;
//       try {
//         const res = await axios.get('http://localhost:5000/api/meetings/my-meetings', { withCredentials: true });
//         if (res.data.success) {
//           setMeetings(res.data.data);
//         }
//       } catch (err) {
//         setError('Failed to fetch meeting history.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (!authLoading) {
//       fetchMeetings();
//     }
//   }, [isAuthenticated, authLoading]);

//   if (authLoading) {
//     return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading...</div>;
//   }
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex flex-col">
//       <Starfield />
//       {/* <Header /> */}
//       <main className="flex-grow p-4 sm:p-6 lg:p-8 relative z-10">
//         <div className="max-w-5xl mx-auto">
//           <h1 className="text-3xl sm:text-4xl font-['Orbitron'] font-bold text-white mb-8">My Meeting History</h1>
//           {loading ? (
//             <p>Loading your meetings...</p>
//           ) : error ? (
//             <p className="text-red-400">{error}</p>
//           ) : meetings.length === 0 ? (
//             <div className="text-center bg-[#1a2138]/60 p-8 rounded-2xl">
//               <Icon id="history" className="text-4xl text-[#6366f1] mb-4" />
//               <h2 className="text-2xl font-bold">No Meetings Yet</h2>
//               <p className="text-[#e2e8f0]/70 mt-2">You haven't hosted or joined any meetings. <br/> Start by creating one from your dashboard!</p>
//               <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg text-white font-semibold">Go to Dashboard</button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {meetings.map((meeting) => (
//                 <div key={meeting._id} className="bg-[#1a2138]/80 backdrop-blur-md border border-[#6366f1]/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
//                   <div className="flex-1">
//                     <h3 className="font-bold text-lg text-white">{meeting.title}</h3>
//                     <p className="text-sm text-[#e2e8f0]/70">Code: <span className="font-mono">{meeting.code}</span></p>
//                     <p className="text-xs text-[#e2e8f0]/50">Hosted by: {meeting.host.username}</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm font-semibold">{new Date(meeting.createdAt).toLocaleDateString()}</p>
//                     <p className={`text-xs font-bold uppercase ${meeting.status === 'live' ? 'text-green-400' : 'text-red-400'}`}>{meeting.status}</p>
//                   </div>
//                   <button 
//                     onClick={() => navigate(`/meeting/${meeting.code}`)} 
//                     disabled={meeting.status === 'ended'}
//                     className="px-6 py-2 rounded-lg bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold transition"
//                   >
//                     {meeting.status === 'ended' ? 'Ended' : 'Rejoin'}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
//       {/* <Footer /> */}
//     </div>
//   );
// }
