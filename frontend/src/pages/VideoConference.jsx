import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';


// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

export default function VideoConference() {
  const { roomID } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  

  const fetchMeetingDetails = useCallback(async () => {
    if (!user || !roomID) {
      console.log("hiiiiiiiii",user, roomID);
        if(!isAuthenticated) setLoading(false);
        return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/meetings/${roomID}`, { withCredentials: true });
      if (res.data.success) {
        setMeeting(res.data.meeting);
      } else {
        throw new Error(res.data.error || 'Failed to load meeting data.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Meeting not found or an error occurred.");
    } finally {
      setLoading(false);
    }
  }, [roomID, isAuthenticated]);

  console.log("ppppppppppp",user, roomID, meeting);
const isHost = meeting && user && meeting.host._id === user._id;

  useEffect(() => {
    if (!authLoading) {
        fetchMeetingDetails();
    }
    const interval = setInterval(() => {
        if(!authLoading) fetchMeetingDetails();
    }, 10000);
    return () => clearInterval(interval);
  }, [authLoading, fetchMeetingDetails]);
    
  const myMeeting = async (element) => {
    if (!element || !user || !roomID) return;

    const appIDString = import.meta.env.VITE_ZEGO_APP_ID;
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

    if (!appIDString || !serverSecret) {
      console.error("ZegoCloud credentials are not configured.");
      element.innerHTML = '<p style="color: red; text-align: center;">Video conference credentials are not set up.</p>';
      return;
    }

    const appID = parseInt(appIDString);
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, user._id, user.username);
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    
    zp.joinRoom({
      container: element,
      sharedLinks: [{ name: 'Copy meeting link', url: window.location.href }],
      scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
      showScreenSharingButton: true,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
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
        logoURL: '', 
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
  };
  
  if (authLoading || loading) {
    return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading Meeting...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (error) {
    return (
        <div className="bg-[#0a0e17] min-h-screen flex flex-col text-white">
            {/* <Header /> */}
            <main className="flex-grow flex items-center justify-center text-center p-4">
                <div>
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Meeting</h2>
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
        <div className="flex-grow lg:w-3/4 bg-black" ref={myMeeting} />
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
                Participants ({meeting.participants?.length})
              </h3>
              <ul className="space-y-2 flex-grow overflow-y-auto">
                {meeting?.participants?.map((p) => (
                  <li key={p?.user?._id} className="flex items-center bg-[#0a0e17]/50 p-2 rounded-lg">
                    <Icon id="user-circle" className="w-5 h-5 mr-3 text-[#e2e8f0]/70" />
                    <span className="font-medium text-sm">{p?.user?.username}</span>
                    {p?.user?._id === meeting?.host?._id && <span className="ml-auto text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/20 px-1.5 py-0.5 rounded-full">Host</span>}
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-[#6366f1]/20 pt-4">
                {isHost && (
                  <p className="text-xs text-center text-[#e2e8f0]/60">
                    As the host, leaving the video call will end the meeting for all participants.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p>Loading details...</p>
          )}
        </aside>
      </main>
    </div>
  );
}




// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
// import axios from 'axios';

// export default function VideoConference() {
//   const { roomID } = useParams(); // Get the meeting ID from the URL
//   const { user } = useAuth(); // Get the current user from the Auth context
//   const [isHost, setIsHost] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // This effect runs once to fetch meeting details and determine if the user is the host.
//   useEffect(() => {
//     const fetchMeetingDetails = async () => {
//       if (!roomID || !user) return;
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/meetings/${roomID}`,
//           { withCredentials: true } // The config object is the second argument
//         );
//         if (res.data.success) {
//           const meeting = res.data.meeting;
//           // Check if the logged-in user's ID matches the meeting host's ID
//           if (meeting.host._id === user._id) {
//             setIsHost(true);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch meeting details to determine host status", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMeetingDetails();
//   }, [roomID, user]);
    
//   // Function to handle the ZegoCloud UI Kit initialization
//   const myMeeting = async (element) => {
//     if (!element || !user || !roomID) {
//       return;
//     }

//     // Fetch credentials from environment variables
//     const appIDString = import.meta.env.VITE_ZEGO_APP_ID;
//     const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

//     if (!appIDString || !serverSecret) {
//       console.error("ZegoCloud credentials are not configured in .env.local");
//       return;
//     }

//     const appID = parseInt(appIDString);

//     // Generate a token for the user to join the room
//     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       appID,
//       serverSecret,
//       roomID,
//       user._id, // User's unique ID from context
//       user.username // User's display name from context
//     );

//     const zp = ZegoUIKitPrebuilt.create(kitToken);
    
//     // Join the room and configure the UI
//     zp.joinRoom({
//       container: element,
//       sharedLinks: [
//         {
//           name: 'Copy meeting link',
//           url: `${window.location.protocol}//${window.location.host}/meeting/${roomID}`,
//         },
//       ],
//       scenario: {
//         mode: ZegoUIKitPrebuilt.GroupCall,
//       },
//       showScreenSharingButton: true,
//       // When the user leaves the room, call the appropriate backend endpoint.
//       onLeaveRoom: async () => {
//         try {
//           if (isHost) {
//             // If the user is the host, end the meeting for everyone.
//             await axios.delete(`http://localhost:5000/api/meetings/${roomID}`, {
//               withCredentials: true,
//             });
//           } else {
//             // If the user is a participant, just leave the meeting.
//             await axios.post(`http://localhost:5000/api/meetings/${roomID}/leave`, {}, {
//               withCredentials: true,
//             });
//           }
//         } catch (error) {
//           console.error("Failed to leave or end the meeting:", error);
//         } finally {
//           // Always redirect to the homepage after leaving.
//           window.location.href = '/';
//         }
//       }
//     });
//   };
  
//   // Render a loading/error state until everything is ready
//   if (loading || !user || !roomID || !import.meta.env.VITE_ZEGO_APP_ID || !import.meta.env.VITE_ZEGO_SERVER_SECRET) {
//     return (
//         <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backgroundColor: 'black' }}>
//             <p>Loading Video Conference...</p>
//         </div>
//     );
//   }

//   return (
//     <div
//       className="myCallContainer"
//       ref={myMeeting}
//       style={{ width: '100%', height: '100%' }}
//     ></div>
//   );
// }


