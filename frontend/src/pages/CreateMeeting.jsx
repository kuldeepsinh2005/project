// src/pages/CreateMeeting.jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreateMeeting() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [meetingId, setMeetingId] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Axios instance with cookies
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("You must be logged in to create a meeting.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await api.post("/meetings", {
        title,
      });

      console.log(`Meeting`,res.data);
      setMeetingId("");
      setTitle("");

      // Optional: Redirect to meeting page
      // navigate(`/meeting/${res.data.data.meetingId}`);
    } catch (err) {
      console.error("Create meeting failed:", err);
      setError(err.response?.data?.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-600">Please log in to create a meeting.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create a Meeting</h2>

      {error && <div className="bg-red-100 text-red-600 p-2 mb-3 rounded">{error}</div>}
      {successMessage && <div className="bg-green-100 text-green-600 p-2 mb-3 rounded">{successMessage}</div>}

      <form onSubmit={handleCreateMeeting} className="space-y-4">
        <div>
         
        </div>

        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Meeting"}
        </button>
      </form>
    </div>
  );
}
