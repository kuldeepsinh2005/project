// src/context/AuthContext.js
// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Always send cookies with requests
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  // ✅ Get logged-in user
  const getMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      setIsAuthenticated(true);
      console.log("Current user:", res.data.user);
      console.log("Is authenticated:", isAuthenticated);

    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    }finally {
      setLoading(false); // Always stop loading
    }
  };

  // ✅ Login
const login = async (email, password) => {
  try {
    await api.post("/auth/login", { email, password });
    await getMe(); // refresh state after login
    return true; // login successful
  } catch (err) {
    console.error("Login failed:", err);
    return false; // login failed
  }finally {
      setLoading(false); // Always stop loading
  }
};


  // ✅ Register
const register = async (firstName, lastName, username, email, password) => {
  try {
    await api.post("/auth/register", {
      firstName,
      lastName,
      username,
      email,
      password,
    });
    return true;
  } catch (err) {
    console.error("Registration failed:", err);
    return false;
  }
};


  // ✅ Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // ✅ On mount, try to restore session
  useEffect(() => {
    (async () => {
      try {
        await getMe();
        setLoading(false);
      } catch (error) {
        console.error("Failed to get user on mount:", error);
        setUser(null);
      }
      
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        getMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
