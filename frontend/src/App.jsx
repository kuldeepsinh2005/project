// // src/App.jsx


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import CreateMeeting from "./pages/CreateMeeting";
import CreateMeetingPage from "./pages/createMeetingTest";
import JoinMeeting from "./pages/JoinMeeting";
import MeetingRoom from "./pages/MeetingRoom";
import MeetingPage from "./pages/MeetingPage";
import TestPage from "./pages/TestPage";
import VideoConference from "./pages/VideoConference";
import './App.css'; // Import your global styles
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-meeting" element={<CreateMeeting />} />
        <Route path="/join-meeting" element={<JoinMeeting />} />
        <Route path="/meeting/:id" element={<MeetingRoom />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/room/:meetingId" element={<MeetingPage />} />
        <Route path="/test/createmeeting" element={<CreateMeetingPage />} />
        <Route path="/test/video/:roomID" element={<VideoConference />} />
      </Routes>
    </Router>
  );
}

export default App;


// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './pages/LoginPage.jsx';
// import RegisterPage from './pages/RegisterPage.jsx';
// import DashboardPage from './pages/DashboardPage.jsx';
// import MeetingPage from './pages/MeetingPage.jsx';
// import { AuthProvider, useAuth } from './context/AuthContext.jsx';
// import HomePage from "./pages/HomePage.jsx";

// function PrivateRoute({ children }) {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/login" replace />;
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/dashboard" element={<DashboardPage />} />
//         <Route path="/meeting/:id" element={<MeetingPage />} />
//       </Routes>
//       {/* <Routes>
//         <Route path="/" element={<Navigate to="/dashboard" />} />
//         <Route path="/register" element={<RegisterPage />} />
//          <Route path="/login" element={<LoginPage />} />
//         <Route
//           path="/dashboard"
//           element={
//             <PrivateRoute>
//               <DashboardPage />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/meeting/:meetingId"
//           element={
//             <PrivateRoute>
//               <MeetingPage />
//             </PrivateRoute>
//           }
//         />
//       </Routes> */}
//     </AuthProvider>
//   );
// }
