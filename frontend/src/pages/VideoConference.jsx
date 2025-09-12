import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';
// import Header from '../components/Header.jsx';

// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function MeetingPage() {
  const { roomID } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const zpInstance = useRef(null);
  const meetingContainerRef = useRef(null);

  // --- State for Recording ---
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(0);

  // --- UPDATED: This effect now runs ONCE to join the meeting ---
  // It no longer uses setInterval for polling, making it much more efficient.
  useEffect(() => {
    const joinAndFetchDetails = async () => {
      if (authLoading || !isAuthenticated || !roomID) {
        if (!authLoading && !isAuthenticated) setLoading(false);
        return;
      }
      
      try {
        // This single call now handles everything: joining for the first time,
        // rejoining after leaving, and reloading the page.
        const res = await axios.post(`http://localhost:5000/api/meetings/${roomID}/join`, {}, { withCredentials: true });

        if (res.data.success) {
            setMeeting(res.data.meeting);
            if(user && res.data.meeting.host._id === user._id) {
              setIsHost(true);
            }
        } else {
            throw new Error(res.data.error);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Could not join the meeting.");
      } finally {
        setLoading(false);
      }
    };
    
    joinAndFetchDetails();

  }, [authLoading, isAuthenticated, roomID, user]);

  
  const startRecording = async () => {
    setError("");
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'browser' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      const audioContext = new AudioContext();
      const mixedAudio = audioContext.createMediaStreamDestination();

      if (displayStream.getAudioTracks().length > 0) {
        const displaySource = audioContext.createMediaStreamSource(displayStream);
        displaySource.connect(mixedAudio);
      }

      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(mixedAudio);

      const finalStream = new MediaStream([
        displayStream.getVideoTracks()[0],
        mixedAudio.stream.getAudioTracks()[0]
      ]);

      const recorder = new MediaRecorder(finalStream, { mimeType: 'video/webm' });
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      displayStream.getVideoTracks()[0].onended = () => {
        stopRecordingAndUpload();
        micStream.getTracks().forEach(track => track.stop());
      };
      
      recorder.onstop = () => setIsRecording(false);

      recorder.start();
      setRecordingStartTime(Date.now());
      setIsRecording(true);

    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Could not start recording. Please grant all necessary permissions.");
    }
  };

  const stopRecordingAndUpload = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      const chunksToUpload = [...recordedChunks];
      setRecordedChunks([]);

      const upload = async () => {
        setUploading(true);
        const blob = new Blob(chunksToUpload, { type: 'video/webm' });
        const duration = Math.round((Date.now() - recordingStartTime) / 1000);

        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const uniqueTitle = `${meeting?.title || 'Untitled'} - ${formattedDate}, ${formattedTime}`;

        const formData = new FormData();
        formData.append('recording', blob, `${roomID}-${Date.now()}.webm`);
        formData.append('title', uniqueTitle);
        formData.append('duration', duration);
        
        try {
          await axios.post(
            `http://localhost:5000/api/recordings/${roomID}/upload`,
            formData,
            { 
              withCredentials: true,
              headers: { 'Content-Type': 'multipart/form-data' }
            }
          );
        } catch (err) {
          console.error("Upload failed:", err);
          setError("Failed to upload recording.");
        } finally {
          setUploading(false);
          setRecordingStartTime(0);
        }
      };
      upload();
    }
  }, [isRecording, recordedChunks, roomID, meeting, recordingStartTime]);



  const myMeetingRef = useCallback(async (element) => {
    if (element && user && roomID && !zpInstance.current) {
        meetingContainerRef.current = element;
        const appIDString = import.meta.env.VITE_ZEGO_APP_ID;
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!appIDString || !serverSecret) return;

        const appID = parseInt(appIDString);
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, user._id, user.username);
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
        zpInstance.current = zp;

        zp.joinRoom({
            container: element,
            sharedLinks: [{ name: 'Copy meeting link', url: window.location.href }],
            scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
            showScreenSharingButton: true,
            showPreJoinView: false,
            onLeaveRoom: async () => {
                try {
                    if (isHost) {
                        await axios.delete(`http://localhost:5000/api/meetings/${roomID}`, { withCredentials: true });
                    } else {
                        await axios.post(`http://localhost:5000/api/meetings/${roomID}/leave`, {}, { withCredentials: true });
                    }
                } catch (error) {
                    console.error("Failed to leave or end the meeting:", error);
                } finally {
                    navigate('/');
                }
            },
            branding: {
                // logoURL: 'https://i.postimg.cc/pX5Yf7Vq/rocket-icon.png', 
            },
            customCSS: `
              .zego-uikit-prebuilt-container { background-color: #0a0e17 !important; color: #e2e8f0 !important; }
              .zego-uikit-top-bar { background-color: #1a2138 !important; border-bottom: 1px solid #6366f133 !important; }
              .zego-uikit-bottom-bar { background-color: #1a2138 !important; border-top: 1px solid #6366f133 !important; }
              .zego-uikit-prebuilt-video-container-card { background-color: #1a2138 !important; border: 1px solid #6366f133 !important; }
              .zego-uikit-prebuilt-participant-name { color: #e2e8f0 !important; }
              .zego-uikit-prebuilt-button { background-color: #6366f133 !important; color: #e2e8f0 !important; }
              .zego-uikit-prebuilt-button.leave { background-color: #ef4444 !important; }
            `
        });
    }
  }, [user, roomID, isHost, navigate]);

  useEffect(() => {
    return () => {
        if (zpInstance.current) {
            zpInstance.current.destroy();
            zpInstance.current = null;
        }
    }
  }, []);

  if (authLoading || loading) {
    return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Joining Meeting...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (error && !meeting) {
    return (
        <div className="bg-[#0a0e17] min-h-screen flex flex-col text-white">
            {/* <Header /> */}
            <main className="flex-grow flex items-center justify-center text-center p-4">
                <div>
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p>{error}</p>
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-grow flex flex-col lg:flex-row">
        <div className="flex-grow lg:w-3/4 bg-black" ref={myMeetingRef} />
        <aside className="w-full lg:w-1/4 bg-[#1a2138] p-4 flex flex-col border-l border-[#6366f1]/20">
          {meeting ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white truncate">{meeting.title}</h2>
                <p className="mt-1 text-sm text-[#e2e8f0]/70">
                  Code: <span className="font-mono bg-[#0a0e17] px-2 py-1 rounded">{meeting.code}</span>
                </p>
              </div>
              <h3 className="text-lg font-bold mb-3 border-t border-[#6366f1]/20 pt-3">
                Participants ({meeting.participants?.filter(p => !p.leavedAt).length})
              </h3>
              <ul className="space-y-2 flex-grow overflow-y-auto">
                {meeting.participants?.filter(p => !p.leavedAt).map((p) => (
                  <li key={p.user._id} className="flex items-center bg-[#0a0e17]/50 p-2 rounded-lg">
                    <Icon id="user-circle" className="w-5 h-5 mr-3 text-[#e2e8f0]/70" />
                    <span className="font-medium text-sm">{p.user.username}</span>
                    {p.user._id === meeting.host._id && <span className="ml-auto text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/20 px-1.5 py-0.5 rounded-full">Host</span>}
                  </li>
                ))}
              </ul>

              {isHost && (
                <div className="mt-4 border-t border-[#6366f1]/20 pt-4">
                  <h3 className="text-lg font-bold mb-3">Host Controls</h3>
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      disabled={uploading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      <Icon id="record-vinyl" className="mr-2" />
                      {uploading ? 'Uploading...' : 'Start Recording'}
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecordingAndUpload}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors animate-pulse"
                    >
                      <Icon id="stop-circle" className="mr-2" />
                      Stop Recording
                    </button>
                  )}
                   <p className="text-xs text-center text-[#e2e8f0]/60 mt-2">
                    You will be prompted to select this tab for recording.
                  </p>
                   {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
              )}
            </>
          ) : (
            <p>Loading details...</p>
          )}
        </aside>
      </main>
    </div>
  );
}

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useParams, useNavigate, Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext.jsx';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
// import axios from 'axios';
// // import Header from '../components/Header.jsx';

// // --- Reusable Icon Component ---
// const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// export default function MeetingPage() {
//   const { roomID } = useParams();
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
  
//   const [meeting, setMeeting] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [isHost, setIsHost] = useState(false);
//   const zpInstance = useRef(null);
//   const meetingContainerRef = useRef(null);

//   // --- State for Recording ---
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [recordedChunks, setRecordedChunks] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [recordingStartTime, setRecordingStartTime] = useState(0);

//   const fetchMeetingDetails = useCallback(async () => {
//     if (!isAuthenticated || !roomID) {
//       if(!isAuthenticated) setLoading(false);
//       return;
//     }
//     try {
//       const res = await axios.get(`http://localhost:5000/api/meetings/${roomID}`, { withCredentials: true });
//       if (res.data.success) {
//         const fetchedMeeting = res.data.meeting;
//         setMeeting(fetchedMeeting);
//         if (user && fetchedMeeting.host._id === user._id) {
//           setIsHost(true);
//         }
//       } else {
//         throw new Error(res.data.error || 'Failed to load meeting data.');
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || "Meeting not found or an error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   }, [roomID, isAuthenticated, user]);

//   useEffect(() => {
//     if (!authLoading) fetchMeetingDetails();
//     const interval = setInterval(() => { if (!authLoading) fetchMeetingDetails(); }, 10000);
//     return () => clearInterval(interval);
//   }, [authLoading, fetchMeetingDetails]);
  
//   const startRecording = async () => {
//     setError("");
//     try {
//       const displayStream = await navigator.mediaDevices.getDisplayMedia({
//         video: { mediaSource: 'browser' },
//         audio: { echoCancellation: true, noiseSuppression: true },
//       });

//       const micStream = await navigator.mediaDevices.getUserMedia({
//         audio: { echoCancellation: true, noiseSuppression: true },
//       });

//       const audioContext = new AudioContext();
//       const mixedAudio = audioContext.createMediaStreamDestination();

//       if (displayStream.getAudioTracks().length > 0) {
//         const displaySource = audioContext.createMediaStreamSource(displayStream);
//         displaySource.connect(mixedAudio);
//       }

//       const micSource = audioContext.createMediaStreamSource(micStream);
//       micSource.connect(mixedAudio);

//       const finalStream = new MediaStream([
//         displayStream.getVideoTracks()[0],
//         mixedAudio.stream.getAudioTracks()[0]
//       ]);

//       const recorder = new MediaRecorder(finalStream, { mimeType: 'video/webm' });
//       setMediaRecorder(recorder);

//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           setRecordedChunks((prev) => [...prev, event.data]);
//         }
//       };

//       displayStream.getVideoTracks()[0].onended = () => {
//         stopRecordingAndUpload();
//         micStream.getTracks().forEach(track => track.stop());
//       };
      
//       recorder.onstop = () => setIsRecording(false);

//       recorder.start();
//       setRecordingStartTime(Date.now());
//       setIsRecording(true);

//     } catch (err) {
//       console.error("Failed to start recording:", err);
//       setError("Could not start recording. Please grant all necessary permissions.");
//     }
//   };

//   const stopRecordingAndUpload = () => {
//     if (mediaRecorder && mediaRecorder.state === 'recording') {
//       mediaRecorder.stop();
//     }
//   };

//   useEffect(() => {
//     if (!isRecording && recordedChunks.length > 0) {
//       const chunksToUpload = [...recordedChunks];
//       setRecordedChunks([]);

//       const upload = async () => {
//         setUploading(true);
//         const blob = new Blob(chunksToUpload, { type: 'video/webm' });
//         const duration = Math.round((Date.now() - recordingStartTime) / 1000);

//         const now = new Date();
//         const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//         const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//         const uniqueTitle = `${meeting?.title || 'Untitled'} - ${formattedDate}, ${formattedTime}`;

//         const formData = new FormData();
//         formData.append('recording', blob, `${roomID}-${Date.now()}.webm`);
//         formData.append('title', uniqueTitle);
//         formData.append('duration', duration);
        
//         try {
//           await axios.post(
//             `http://localhost:5000/api/recordings/${roomID}/upload`,
//             formData,
//             { 
//               withCredentials: true,
//               headers: { 'Content-Type': 'multipart/form-data' }
//             }
//           );
//         } catch (err) {
//           console.error("Upload failed:", err);
//           setError("Failed to upload recording.");
//         } finally {
//           setUploading(false);
//           setRecordingStartTime(0);
//         }
//       };
//       upload();
//     }
//   }, [isRecording, recordedChunks, roomID, meeting, recordingStartTime]);

//   const myMeetingRef = useCallback(async (element) => {
//     if (element && user && roomID && !zpInstance.current) {
//         meetingContainerRef.current = element;
//         const appIDString = import.meta.env.VITE_ZEGO_APP_ID;
//         const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

//         if (!appIDString || !serverSecret) return;

//         const appID = parseInt(appIDString);
//         const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, user._id, user.username);
//         const zp = ZegoUIKitPrebuilt.create(kitToken);
        
//         zpInstance.current = zp;

//         zp.joinRoom({
//             container: element,
//             sharedLinks: [{ name: 'Copy meeting link', url: window.location.href }],
//             scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
//             showScreenSharingButton: true,
//             showPreJoinView: false,
//             onLeaveRoom: async () => {
//                 try {
//                     if (isHost) {
//                         await axios.delete(`http://localhost:5000/api/meetings/${roomID}`, { withCredentials: true });
//                     } else {
//                         await axios.post(`http://localhost:5000/api/meetings/${roomID}/leave`, {}, { withCredentials: true });
//                     }
//                 } catch (error) {
//                     console.error("Failed to leave or end the meeting:", error);
//                 } finally {
//                     navigate('/');
//                 }
//             },
//             branding: {
//                 logoURL: 'https://i.postimg.cc/pX5Yf7Vq/rocket-icon.png', 
//             },
//             customCSS: `
//               .zego-uikit-prebuilt-container { background-color: #0a0e17 !important; color: #e2e8f0 !important; }
//               .zego-uikit-top-bar { background-color: #1a2138 !important; border-bottom: 1px solid #6366f133 !important; }
//               .zego-uikit-bottom-bar { background-color: #1a2138 !important; border-top: 1px solid #6366f133 !important; }
//               .zego-uikit-prebuilt-video-container-card { background-color: #1a2138 !important; border: 1px solid #6366f133 !important; }
//               .zego-uikit-prebuilt-participant-name { color: #e2e8f0 !important; }
//               .zego-uikit-prebuilt-button { background-color: #6366f133 !important; color: #e2e8f0 !important; }
//               .zego-uikit-prebuilt-button.leave { background-color: #ef4444 !important; }
//             `
//         });
//     }
//   }, [user, roomID, isHost, navigate]);

//   useEffect(() => {
//     return () => {
//         if (zpInstance.current) {
//             zpInstance.current.destroy();
//             zpInstance.current = null;
//         }
//     }
//   }, []);

//   if (authLoading || loading) {
//     return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading Meeting...</div>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
  
//   if (error && !meeting) {
//     return (
//         <div className="bg-[#0a0e17] min-h-screen flex flex-col text-white">
//             {/* <Header /> */}
//             <main className="flex-grow flex items-center justify-center text-center p-4">
//                 <div>
//                     <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Meeting</h2>
//                     <p>{error}</p>
//                 </div>
//             </main>
//         </div>
//     );
//   }

//   return (
//     <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen flex flex-col">
//       {/* <Header /> */}
//       <main className="flex-grow flex flex-col lg:flex-row">
//         <div className="flex-grow lg:w-3/4 bg-black" ref={myMeetingRef} />
//         <aside className="w-full lg:w-1/4 bg-[#1a2138] p-4 flex flex-col border-l border-[#6366f1]/20">
//           {meeting ? (
//             <>
//               <div className="mb-4">
//                 <h2 className="text-xl font-bold text-white truncate">{meeting.title}</h2>
//                 <p className="mt-1 text-sm text-[#e2e8f0]/70">
//                   Code: <span className="font-mono bg-[#0a0e17] px-2 py-1 rounded">{meeting.code}</span>
//                 </p>
//               </div>
//               <h3 className="text-lg font-bold mb-3 border-t border-[#6366f1]/20 pt-3">
//                 Participants ({meeting.participants?.filter(p => !p.leavedAt).length})
//               </h3>
//               <ul className="space-y-2 flex-grow overflow-y-auto">
//                 {meeting.participants?.filter(p => !p.leavedAt).map((p) => (
//                   <li key={p.user._id} className="flex items-center bg-[#0a0e17]/50 p-2 rounded-lg">
//                     <Icon id="user-circle" className="w-5 h-5 mr-3 text-[#e2e8f0]/70" />
//                     <span className="font-medium text-sm">{p.user.username}</span>
//                     {p.user._id === meeting.host._id && <span className="ml-auto text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/20 px-1.5 py-0.5 rounded-full">Host</span>}
//                   </li>
//                 ))}
//               </ul>

//               {isHost && (
//                 <div className="mt-4 border-t border-[#6366f1]/20 pt-4">
//                   <h3 className="text-lg font-bold mb-3">Host Controls</h3>
//                   {!isRecording ? (
//                     <button 
//                       onClick={startRecording}
//                       disabled={uploading}
//                       className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
//                     >
//                       <Icon id="record-vinyl" className="mr-2" />
//                       {uploading ? 'Uploading...' : 'Start Recording'}
//                     </button>
//                   ) : (
//                     <button 
//                       onClick={stopRecordingAndUpload}
//                       className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors animate-pulse"
//                     >
//                       <Icon id="stop-circle" className="mr-2" />
//                       Stop Recording
//                     </button>
//                   )}
//                    <p className="text-xs text-center text-[#e2e8f0]/60 mt-2">
//                     You will be prompted to select this tab for recording.
//                   </p>
//                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
//                 </div>
//               )}
//             </>
//           ) : (
//             <p>Loading details...</p>
//           )}
//         </aside>
//       </main>
//     </div>
//   );
// }
