import { useState } from "react";
import MeetingRoom from "./MeetingRoom";
import { apiFetch } from "../api";

export default function Home() {
  const [joined, setJoined] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [username, setUsername] = useState(""); // from logged-in user later

  async function handleCreate() {
    const meeting = await apiFetch("/api/meetings/create", { method: "POST" });
    setMeetingId(meeting.meetingId);
    setUsername(meeting.participants[0].username);
    setJoined(true);
  }

  async function handleJoin() {
    await apiFetch("/api/meetings/join", {
      method: "POST",
      body: JSON.stringify({ meetingId })
    });
    setJoined(true);
  }

  if (joined) {
    return <MeetingRoom meetingId={meetingId} username={username} />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Meetings</h1>
      <button onClick={handleCreate}>Create Meeting</button>
      <div>
        <input placeholder="Meeting ID" value={meetingId} onChange={e => setMeetingId(e.target.value)} />
        <button onClick={handleJoin}>Join Meeting</button>
      </div>
    </div>
  );
}
