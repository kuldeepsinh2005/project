// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";


const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  console.log("🔄 AuthProvider MOUNTED");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  

  console.log("🔄 AuthProvider MOUNTED — at top level");

  useEffect(() => {
    console.log("🔄 AuthProvider useEffect — first mount");
    return () => {
      console.log("❌ AuthProvider UNMOUNTED");
    };
  }, []);



  useEffect(() => {
    const checkUserSession = async () => {
      console.log("🔎 Checking session...");
      try {
        const res = await api.get("/auth/me");
        if (res.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
          console.log("✅ User restored:", res.data.user);
        } else {
          console.log("⛔ No user in session");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("❌ Session check failed:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        console.log("✅ Logged in:", res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Login failed:", err);
      return false;
    }
  };

  const register = async (firstName, lastName, username, email, password) => {
    try {
      const res = await api.post("/auth/register", {
        firstName,
        lastName,
        username,
        email,
        password,
      });
      if (res.data.success) {
        return await login(email, password);
      }
      return false;
    } catch (err) {
      console.error("❌ Registration failed:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
