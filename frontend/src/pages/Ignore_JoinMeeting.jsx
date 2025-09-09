import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import axios from 'axios';
export default function JoinMeeting() {
  const { isAuthenticated, loading } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/meetings/${code}/join`,
        {}, // Request body
        { withCredentials: true } // Config object
      );

      console.log("Join response:", res);
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.error || "Failed to join meeting");
      navigate(`/test/video/${res.data.meeting.code}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto" }}>
      <h2>Join a Meeting</h2>
      <form onSubmit={handleJoin}>
        <label>Meeting Code</label>
        <input
          style={{ display: "block", width: "100%", marginTop: 6, marginBottom: 12 }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-char code"
          required
        />
        <button type="submit">Join</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
