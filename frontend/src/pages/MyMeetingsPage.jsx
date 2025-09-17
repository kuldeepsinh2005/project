import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import Starfield from '../components/Starfield.jsx';

const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// --- (MeetingDetailModal and MeetingRow components remain the same) ---
const MeetingDetailModal = ({ meeting, onClose, user }) => {


    if (!meeting) return null;
    const allParticipants = meeting.participants;

    // console.log(allParticipants);

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

const MeetingRow = ({ meeting, onSelect }) => {
    const navigate = useNavigate();
    const [isRejoining, setIsRejoining] = useState(false);

    const handleRejoin = async () => {
        setIsRejoining(true);
        try {
            await axios.post(`http://localhost:5000/api/meetings/${meeting.code}/join`, {}, { withCredentials: true });
            navigate(`/test/video/${meeting.code}`);
        } catch (err) {
            console.error("Failed to rejoin meeting:", err);
            alert("Could not rejoin the meeting. It may have ended or an error occurred.");
        } finally {
            setIsRejoining(false);
        }
    };

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
                onClick={handleRejoin} 
                disabled={meeting.status === 'ended' || isRejoining}
                className="px-6 py-2 rounded-lg bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold transition"
            >
                {isRejoining ? 'Rejoining...' : (meeting.status === 'ended' ? 'Ended' : 'Rejoin')}
            </button>
        </div>
    );
};


// --- UPDATED: More Elegant Pagination Component ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 3; // The max number of page buttons to show (e.g., 1 ... 4 5 6 ... 10)
        const halfPages = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            // If total pages is small, show all page numbers
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show the first page
            pageNumbers.push(1);

            // Determine the range of pages to show around the current page
            let startPage = Math.max(2, currentPage - halfPages + 1);
            let endPage = Math.min(totalPages - 1, currentPage + halfPages - 1);

            if (currentPage <= halfPages) {
                endPage = maxPagesToShow - 1;
            }
            if (currentPage > totalPages - halfPages) {
                startPage = totalPages - maxPagesToShow + 2;
            }

            // Add leading ellipsis if needed
            if (startPage > 2) {
                pageNumbers.push('...');
            }

            // Add the calculated range of pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Add trailing ellipsis if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }

            // Always show the last page
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-[#1a2138] hover:bg-[#6366f1]/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                <Icon id="chevron-left" />
            </button>
            {pageNumbers.map((number, index) => 
                number === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-4 py-2 text-[#e2e8f0]/50">...</span>
                ) : (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`px-4 py-2 rounded-lg transition ${currentPage === number ? 'bg-[#6366f1] text-white font-bold' : 'bg-[#1a2138] hover:bg-[#6366f1]/20'}`}
                    >
                        {number}
                    </button>
                )
            )}
            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-[#1a2138] hover:bg-[#6366f1]/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                <Icon id="chevron-right" />
            </button>
        </div>
    );
};


export default function MyMeetingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [error, setError] = useState('');

  // --- State for hosted and participated meetings ---
  const [hosted, setHosted] = useState({ meetings: [], page: 1, totalPages: 1, loading: true, totalMeetings: 0 });
  const [participated, setParticipated] = useState({ meetings: [], page: 1, totalPages: 1, loading: true, totalMeetings: 0 });

  // Fetch HOSTED meetings
  useEffect(() => {
    const fetchHosted = async () => {
      if (!isAuthenticated) return;
      setHosted(prev => ({ ...prev, loading: true }));
      try {
        const res = await axios.get(`http://localhost:5000/api/meetings/my-meetings/hosted?page=${hosted.page}&limit=3`, { withCredentials: true });
        if (res.data.success) {
          setHosted(prev => ({ ...prev, meetings: res.data.data, totalPages: res.data.totalPages, totalMeetings: res.data.totalMeetings }));
        }
      } catch (err) { setError('Failed to fetch hosted meetings.'); } 
      finally { setHosted(prev => ({ ...prev, loading: false })); }
    };
    if (!authLoading) fetchHosted();
  }, [isAuthenticated, authLoading, hosted.page]);

  // Fetch PARTICIPATED meetings
  useEffect(() => {
    const fetchParticipated = async () => {
      if (!isAuthenticated) return;
      setParticipated(prev => ({ ...prev, loading: true }));
      try {
        const res = await axios.get(`http://localhost:5000/api/meetings/my-meetings/participated?page=${participated.page}&limit=3`, { withCredentials: true });
        if (res.data.success) {
          setParticipated(prev => ({ ...prev, meetings: res.data.data, totalPages: res.data.totalPages, totalMeetings: res.data.totalMeetings }));
        }
      } catch (err) { setError('Failed to fetch participated meetings.'); } 
      finally { setParticipated(prev => ({ ...prev, loading: false })); }
    };
    if (!authLoading) fetchParticipated();
  }, [isAuthenticated, authLoading, participated.page]);

  if (authLoading) {
    return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex flex-col">
      <Starfield />
      {/* <Header /> */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-['Orbitron'] font-bold text-white mb-8">My Meeting History</h1>
          
          {error && <p className="text-red-400 text-center">{error}</p>}
          
          { (hosted.totalMeetings === 0 && participated.totalMeetings === 0 && !hosted.loading && !participated.loading) ? (
            <div className="text-center bg-[#1a2138]/60 p-8 rounded-2xl">
              <Icon id="history" className="text-4xl text-[#6366f1] mb-4" />
              <h2 className="text-2xl font-bold">No Meetings Yet</h2>
              <p className="text-[#e2e8f0]/70 mt-2">You haven't hosted or joined any meetings. <br/> Start by creating one from your dashboard!</p>
              <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg text-white font-semibold">Go to Dashboard</button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Hosted Meetings Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#8b5cf6] pb-2">Hosted by You</h2>
                {hosted.loading ? <p>Loading hosted meetings...</p> : 
                 hosted.meetings.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {hosted.meetings.map((meeting) => (
                        <MeetingRow key={meeting._id} meeting={meeting} onSelect={setSelectedMeeting} />
                      ))}
                    </div>
                    <Pagination currentPage={hosted.page} totalPages={hosted.totalPages} onPageChange={(page) => setHosted(p => ({ ...p, page }))} />
                  </>
                 ) : <p className="text-[#e2e8f0]/70">You have not hosted any meetings.</p>
                }
              </div>

              {/* Participated Meetings Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#0ea5e9] pb-2">Participated In</h2>
                {participated.loading ? <p>Loading participated meetings...</p> :
                 participated.meetings.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {participated.meetings.map((meeting) => (
                        <MeetingRow key={meeting._id} meeting={meeting} onSelect={setSelectedMeeting} />
                      ))}
                    </div>
                    <Pagination currentPage={participated.page} totalPages={participated.totalPages} onPageChange={(page) => setParticipated(p => ({ ...p, page }))} />
                  </>
                 ) : <p className="text-[#e2e8f0]/70">You have not participated in any meetings.</p>
                }
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

