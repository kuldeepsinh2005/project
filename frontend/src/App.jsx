// // // src/App.jsx

// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MyMeetingsPage from "./pages/MyMeetingsPage";
import CreateMeetingPage from "./pages/CreateMeetingTest";
import VideoConference from "./pages/VideoConference";
import TestPage from "./pages/TestPage";
import MyRecordingsPage from "./pages/MyRecordingsPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import SupportPage from "./pages/SupportPage";

function App() {
  console.log("🚀 App Rendered");
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/my-meetings" element={<MyMeetingsPage />} />
        <Route path="/my-recordings" element={<MyRecordingsPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test/createmeeting" element={<CreateMeetingPage />} />
        <Route path="/test/video/:roomID" element={<VideoConference />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;

