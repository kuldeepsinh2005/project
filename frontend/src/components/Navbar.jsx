import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout,loading } = useAuth();

  if (loading) return <p>Loading...</p>; // prevent showing wrong UI


  return (
    <nav>
      <Link to="/">Home</Link>
      {user && user !== false ? (
        <>
          <span>Welcome, {user.name || user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
