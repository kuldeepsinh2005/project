import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Corrected import path
import axios from 'axios';

// --- Helper Icon Components ---
const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const DoorIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
);

const StopIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


export default function MeetingRoom() {
  const { id } = useParams(); // This is the meeting CODE, not the _id
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isHost = meeting && user && meeting.host && meeting.host._id === user._id;

  const fetchMeetingDetails = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/meetings/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setMeeting(res.data.meeting);
      } else {
        throw new Error(res.data.error || 'Failed to load meeting data.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMeetingDetails();
    }
  }, [id, fetchMeetingDetails]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLeave = async () => {
    setError("");
    try {
      const res = await axios.post(`http://localhost:5000/api/meetings/${meeting.code}/leave`, {}, {
        withCredentials: true,
      });
      if (res.data.success) {
        navigate('/');
      } else {
        throw new Error(res.data.error || "Failed to leave the meeting.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleEnd = async () => {
    setError("");
    try {
      // Corrected to DELETE request as per your backend route
      const res = await axios.delete(`http://localhost:5000/api/meetings/${meeting.code}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        navigate('/');
      } else {
        throw new Error(res.data.error || "Failed to end the meeting.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleRemove = async (participantId) => {
    setError("");
    try {
      // Corrected to DELETE request with the proper URL structure
      const res = await axios.delete(`http://localhost:5000/api/meetings/${meeting.code}/participants/${participantId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        // Refresh meeting details to show updated participant list
        fetchMeetingDetails();
      } else {
        throw new Error(res.data.error || "Failed to remove participant.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-200 bg-red-900 bg-opacity-50 rounded-lg" role="alert">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {meeting ? (
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-3xl font-extrabold text-white">{meeting.title}</h2>
              <p className="mt-1 text-sm text-gray-400">
                Meeting Code: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{meeting.code}</span>
              </p>
              <p className={`mt-2 text-sm font-semibold ${meeting.status === 'live' ? 'text-green-400' : 'text-red-400'}`}>
                Status: {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
              </p>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Participants ({meeting.participants?.length})</h3>
              <ul className="space-y-3">
                {meeting.participants?.map((p) => (
                  <li key={p.user._id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center">
                      <UserIcon className="w-6 h-6 mr-3 text-gray-400" />
                      <span className="font-medium">{p.user.username} {p.user._id === user._id && "(You)"}</span>
                       {p.user._id === meeting.host._id && <span className="ml-2 text-xs font-bold text-indigo-400 bg-gray-900 px-2 py-1 rounded-full">Host</span>}
                    </div>
                    {isHost && p.user._id !== user._id && meeting.status !== "ended" && (
                      <button onClick={() => handleRemove(p.user._id)} className="text-sm font-semibold text-red-400 hover:text-red-300">
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-800 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                {meeting.status !== "ended" ? (
                  <>
                    <button onClick={handleLeave} className="flex-1 inline-flex justify-center items-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-colors duration-200">
                        <DoorIcon className="w-6 h-6 mr-2" />
                        Leave Meeting
                    </button>
                    {isHost && (
                      <button onClick={handleEnd} className="flex-1 inline-flex justify-center items-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors duration-200">
                        <StopIcon className="w-6 h-6 mr-2" />
                        End for All
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-center w-full text-gray-400 font-semibold">This meeting has ended.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>Loading meeting details...</p>
        )}
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { useParams, Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function MeetingRoom() {
//   const { id } = useParams();
//   const { user, isAuthenticated, loading } = useAuth();
//   const [meeting, setMeeting] = useState(null);
//   const [error, setError] = useState("");

//   const isHost = meeting && user && meeting.host && meeting.host._id === user._id;

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await fetch(`/api/meetings/${id}`, { credentials: "include" });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load meeting");
//         setMeeting(data.meeting);
//       } catch (err) {
//         setError(err.message);
//       }
//     };
//     if (id) load();
//   }, [id]);

//   if (loading) return <div>Loading...</div>;
//   if (!isAuthenticated) return <Navigate to="/login" replace />;

//   const leave = async () => {
//     setError("");
//     try {
//       const res = await fetch(`/api/meetings/${id}/leave`, {
//         method: "POST",
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to leave");
//       // You can navigate back to home or join screen
//       window.location.href = "/";
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const end = async () => {
//     setError("");
//     try {
//       const res = await fetch(`/api/meetings/${id}/end`, {
//         method: "POST",
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to end meeting");
//       window.location.href = "/";
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const remove = async (participantId) => {
//     setError("");
//     try {
//       const res = await fetch(`/api/meetings/${id}/remove`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ participantId }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to remove participant");

//       // Refresh participants
//       const fresh = await fetch(`/api/meetings/${id}`, { credentials: "include" });
//       const freshData = await fresh.json();
//       setMeeting(freshData.meeting);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 720, margin: "24px auto" }}>
//       <h2>Meeting Room</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {meeting ? (
//         <>
//           <p><strong>Title:</strong> {meeting.title}</p>
//           <p><strong>Code:</strong> {meeting.code}</p>
//           <p><strong>Status:</strong> {meeting.status}</p>
//           <p><strong>Host:</strong> {meeting.host?.username}</p>

//           <h3>Participants</h3>
//           <ul>
//             {meeting.participants?.map((p) => (
//               <li key={p.user._id} style={{ marginBottom: 6 }}>
//                 {p.user.username} {p.user._id === user._id ? "(You)" : ""}
//                 {isHost && p.user._id !== user._id && meeting.status !== "ended" && (
//                   <button style={{ marginLeft: 10 }} onClick={() => remove(p.user._id)}>
//                     Remove
//                   </button>
//                 )}
//               </li>
//             ))}
//           </ul>

//           <div style={{ marginTop: 16 }}>
//             {meeting.status !== "ended" && (
//               <>
//                 <button onClick={leave}>Leave</button>
//                 {isHost && <button onClick={end} style={{ marginLeft: 10 }}>End meeting</button>}
//               </>
//             )}
//             {meeting.status === "ended" && <p>This meeting has ended.</p>}
//           </div>
//         </>
//       ) : (
//         <p>Loading meeting...</p>
//       )}
//     </div>
//   );
// }


// // import { useEffect, useRef, useState } from "react";
// // import { socket } from "../socket";

// // const pcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// // export default function MeetingRoom({ meetingId, username }) {
// //   const localVideoRef = useRef();
// //   const localStreamRef = useRef();
// //   const [peers, setPeers] = useState({});

// //   useEffect(() => {
// //     // 1. Get camera/mic
// //     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
// //       localVideoRef.current.srcObject = stream;
// //       localStreamRef.current = stream;

// //       // 2. Join meeting room
// //       socket.emit("join-room", { meetingId, username });
// //     });

// //     // 3. Socket listeners
// //     socket.on("user-joined", ({ socketId }) => {
// //       const pc = createPeer(socketId, true);
// //       localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
// //     });

// //     socket.on("offer", async ({ from, sdp }) => {
// //       const pc = createPeer(from, false);
// //       await pc.setRemoteDescription(new RTCSessionDescription(sdp));
// //       const answer = await pc.createAnswer();
// //       await pc.setLocalDescription(answer);
// //       socket.emit("answer", { to: from, sdp: answer });
// //     });

// //     socket.on("answer", async ({ from, sdp }) => {
// //       await peers[from].setRemoteDescription(new RTCSessionDescription(sdp));
// //     });

// //     socket.on("ice-candidate", ({ from, candidate }) => {
// //       if (candidate) {
// //         peers[from]?.addIceCandidate(new RTCIceCandidate(candidate));
// //       }
// //     });

// //     socket.on("user-disconnected", id => {
// //       if (peers[id]) {
// //         peers[id].close();
// //         setPeers(prev => {
// //           const updated = { ...prev };
// //           delete updated[id];
// //           return updated;
// //         });
// //       }
// //     });

// //     return () => {
// //       socket.off("user-joined");
// //       socket.off("offer");
// //       socket.off("answer");
// //       socket.off("ice-candidate");
// //       socket.off("user-disconnected");
// //     };
// //   }, []);

// //   function createPeer(id, initiator) {
// //     const pc = new RTCPeerConnection(pcConfig);

// //     pc.onicecandidate = event => {
// //       if (event.candidate) {
// //         socket.emit("ice-candidate", { to: id, candidate: event.candidate });
// //       }
// //     };

// //     pc.ontrack = event => {
// //       const video = document.createElement("video");
// //       video.srcObject = event.streams[0];
// //       video.autoplay = true;
// //       video.playsInline = true;
// //       document.getElementById("remoteVideos").appendChild(video);
// //     };

// //     if (initiator) {
// //       pc.createOffer().then(offer => {
// //         pc.setLocalDescription(offer);
// //         socket.emit("offer", { to: id, sdp: offer });
// //       });
// //     }

// //     setPeers(prev => ({ ...prev, [id]: pc }));
// //     return pc;
// //   }

// //   return (
// //     <div>
// //       <h2>Meeting {meetingId}</h2>
// //       <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "200px" }} />
// //       <div id="remoteVideos"></div>
// //     </div>
// //   );
// // }
