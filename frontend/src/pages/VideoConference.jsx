import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';

export default function VideoConference() {
  const { roomID } = useParams(); // Get the meeting ID from the URL
  const { user } = useAuth(); // Get the current user from the Auth context
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  // This effect runs once to fetch meeting details and determine if the user is the host.
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!roomID || !user) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/meetings/${roomID}`,
          { withCredentials: true } // The config object is the second argument
        );
        if (res.data.success) {
          const meeting = res.data.meeting;
          // Check if the logged-in user's ID matches the meeting host's ID
          if (meeting.host._id === user._id) {
            setIsHost(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch meeting details to determine host status", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [roomID, user]);
    
  // Function to handle the ZegoCloud UI Kit initialization
  const myMeeting = async (element) => {
    if (!element || !user || !roomID) {
      return;
    }

    // Fetch credentials from environment variables
    const appIDString = import.meta.env.VITE_ZEGO_APP_ID;
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

    if (!appIDString || !serverSecret) {
      console.error("ZegoCloud credentials are not configured in .env.local");
      return;
    }

    const appID = parseInt(appIDString);

    // Generate a token for the user to join the room
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      user._id, // User's unique ID from context
      user.username // User's display name from context
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    
    // Join the room and configure the UI
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Copy meeting link',
          url: `${window.location.protocol}//${window.location.host}/meeting/${roomID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showScreenSharingButton: true,
      // When the user leaves the room, call the appropriate backend endpoint.
      onLeaveRoom: async () => {
        try {
          if (isHost) {
            // If the user is the host, end the meeting for everyone.
            await axios.delete(`http://localhost:5000/api/meetings/${roomID}`, {
              withCredentials: true,
            });
          } else {
            // If the user is a participant, just leave the meeting.
            await axios.post(`http://localhost:5000/api/meetings/${roomID}/leave`, {}, {
              withCredentials: true,
            });
          }
        } catch (error) {
          console.error("Failed to leave or end the meeting:", error);
        } finally {
          // Always redirect to the homepage after leaving.
          window.location.href = '/';
        }
      }
    });
  };
  
  // Render a loading/error state until everything is ready
  if (loading || !user || !roomID || !import.meta.env.VITE_ZEGO_APP_ID || !import.meta.env.VITE_ZEGO_SERVER_SECRET) {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backgroundColor: 'black' }}>
            <p>Loading Video Conference...</p>
        </div>
    );
  }

  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: '100%', height: '100%' }}
    ></div>
  );
}


// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// export default function VideoConference() {
//   const { roomID } = useParams(); // Get the meeting ID from the URL
//   const { user } = useAuth(); // Get the current user from the Auth context

//   console.log(roomID,user);
    
//   // Function to handle the ZegoCloud UI Kit initialization
//   const myMeeting = async (element) => {
//     if (!element || !user || !roomID) {
//       // Don't initialize if we don't have the container, user, or roomID
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
//           url: `${window.location.protocol}//${window.location.host}/test/video/${roomID}`,
//         },
//       ],
//       scenario: {
//         mode: ZegoUIKitPrebuilt.GroupCall,
//       },
//       showScreenSharingButton: true,
//       // When the user leaves the room, redirect them to the homepage.
//       onLeaveRoom: () => {
//         window.location.href = '/';
//       }
//     });
//   };
  
//   // Render a loading/error state until everything is ready
//   if (!user || !roomID || !import.meta.env.VITE_ZEGO_APP_ID || !import.meta.env.VITE_ZEGO_SERVER_SECRET) {
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
