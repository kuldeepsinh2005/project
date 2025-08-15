import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MeetingRoom() {
  const { id } = useParams();
  const { user, isAuthenticated, loading } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");

  const isHost = meeting && user && meeting.host && meeting.host._id === user._id;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load meeting");
        setMeeting(data.meeting);
      } catch (err) {
        setError(err.message);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const leave = async () => {
    setError("");
    try {
      const res = await fetch(`/api/meetings/${id}/leave`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to leave");
      // You can navigate back to home or join screen
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  const end = async () => {
    setError("");
    try {
      const res = await fetch(`/api/meetings/${id}/end`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to end meeting");
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (participantId) => {
    setError("");
    try {
      const res = await fetch(`/api/meetings/${id}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ participantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove participant");

      // Refresh participants
      const fresh = await fetch(`/api/meetings/${id}`, { credentials: "include" });
      const freshData = await fresh.json();
      setMeeting(freshData.meeting);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto" }}>
      <h2>Meeting Room</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {meeting ? (
        <>
          <p><strong>Title:</strong> {meeting.title}</p>
          <p><strong>Code:</strong> {meeting.code}</p>
          <p><strong>Status:</strong> {meeting.status}</p>
          <p><strong>Host:</strong> {meeting.host?.username}</p>

          <h3>Participants</h3>
          <ul>
            {meeting.participants?.map((p) => (
              <li key={p.user._id} style={{ marginBottom: 6 }}>
                {p.user.username} {p.user._id === user._id ? "(You)" : ""}
                {isHost && p.user._id !== user._id && meeting.status !== "ended" && (
                  <button style={{ marginLeft: 10 }} onClick={() => remove(p.user._id)}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 16 }}>
            {meeting.status !== "ended" && (
              <>
                <button onClick={leave}>Leave</button>
                {isHost && <button onClick={end} style={{ marginLeft: 10 }}>End meeting</button>}
              </>
            )}
            {meeting.status === "ended" && <p>This meeting has ended.</p>}
          </div>
        </>
      ) : (
        <p>Loading meeting...</p>
      )}
    </div>
  );
}


// import { useEffect, useRef, useState } from "react";
// import { socket } from "../socket";

// const pcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// export default function MeetingRoom({ meetingId, username }) {
//   const localVideoRef = useRef();
//   const localStreamRef = useRef();
//   const [peers, setPeers] = useState({});

//   useEffect(() => {
//     // 1. Get camera/mic
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
//       localVideoRef.current.srcObject = stream;
//       localStreamRef.current = stream;

//       // 2. Join meeting room
//       socket.emit("join-room", { meetingId, username });
//     });

//     // 3. Socket listeners
//     socket.on("user-joined", ({ socketId }) => {
//       const pc = createPeer(socketId, true);
//       localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
//     });

//     socket.on("offer", async ({ from, sdp }) => {
//       const pc = createPeer(from, false);
//       await pc.setRemoteDescription(new RTCSessionDescription(sdp));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socket.emit("answer", { to: from, sdp: answer });
//     });

//     socket.on("answer", async ({ from, sdp }) => {
//       await peers[from].setRemoteDescription(new RTCSessionDescription(sdp));
//     });

//     socket.on("ice-candidate", ({ from, candidate }) => {
//       if (candidate) {
//         peers[from]?.addIceCandidate(new RTCIceCandidate(candidate));
//       }
//     });

//     socket.on("user-disconnected", id => {
//       if (peers[id]) {
//         peers[id].close();
//         setPeers(prev => {
//           const updated = { ...prev };
//           delete updated[id];
//           return updated;
//         });
//       }
//     });

//     return () => {
//       socket.off("user-joined");
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("ice-candidate");
//       socket.off("user-disconnected");
//     };
//   }, []);

//   function createPeer(id, initiator) {
//     const pc = new RTCPeerConnection(pcConfig);

//     pc.onicecandidate = event => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { to: id, candidate: event.candidate });
//       }
//     };

//     pc.ontrack = event => {
//       const video = document.createElement("video");
//       video.srcObject = event.streams[0];
//       video.autoplay = true;
//       video.playsInline = true;
//       document.getElementById("remoteVideos").appendChild(video);
//     };

//     if (initiator) {
//       pc.createOffer().then(offer => {
//         pc.setLocalDescription(offer);
//         socket.emit("offer", { to: id, sdp: offer });
//       });
//     }

//     setPeers(prev => ({ ...prev, [id]: pc }));
//     return pc;
//   }

//   return (
//     <div>
//       <h2>Meeting {meetingId}</h2>
//       <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "200px" }} />
//       <div id="remoteVideos"></div>
//     </div>
//   );
// }
