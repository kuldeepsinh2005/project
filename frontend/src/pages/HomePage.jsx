import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {!isAuthenticated ? (
        <>
          <h1>Welcome to CosmoMeet</h1>
          <p>
            Please{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              login
            </span>{" "}
            or{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => navigate("/register")}
            >
              register
            </span>{" "}
            to continue.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-blue-400 mb-8" >Welcome Back {user?.name || "User"}!</h1>
          <p>Choose an action below:</p>
          <button onClick={() => navigate("/create-meeting")}>Create Meeting</button>
          <button onClick={() => navigate("/join-meeting")}>Join Meeting</button>
          <button onClick={() => navigate("/leave-meeting")}>Leave Meeting</button>
          <button onClick={() => navigate("/end-meeting")}>End Meeting</button>
          <button onClick={() => navigate("/remove-participant")}>Remove Participant</button>
          <br />
          <button onClick={logout} style={{ marginTop: "10px", color: "red" }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}
