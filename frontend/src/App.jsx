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
      </Routes>
      <Footer />
    </>
  );
}

export default App;




// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import RegisterPage from "./pages/RegisterPage";
// import LoginPage from "./pages/LoginPage";
// import Navbar from "./components/Navbar";
// // import CreateMeeting from "./pages/CreateMeeting";
// import CreateMeetingPage from "./pages/CreateMeetingTest";
// // import JoinMeeting from "./pages/JoinMeeting";
// // import MeetingRoom from "./pages/MeetingRoom";
// // import MeetingPage from "./pages/InVision_MeetingPage";
// import TestPage from "./pages/TestPage";
// import VideoConference from "./pages/VideoConference";
// import MyMeetingsPage from "./pages/MyMeetingsPage";
// import './App.css'; // Import your global styles
// import Footer from "./components/Footer";
// import MyRecordingsPage from "./pages/MyRecordingsPage";
// function App() {
//   console.log("rerender of app");
//   return (
    
//     // <Router>
//     <>
//       <Navbar />
      
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/my-meetings" element={<MyMeetingsPage />} />
//         {/* <Route path="/create-meeting" element={<CreateMeeting />} /> */}
//         <Route path="/my-recordings" element={<MyRecordingsPage />} />
//         {/* <Route path="/join-meeting" element={<JoinMeeting />} /> */}
//         {/* <Route path="/meeting/:id" element={<MeetingRoom />} /> */}
//         <Route path="/test" element={<TestPage />} />
//         {/* <Route path="/room/:meetingId" element={<MeetingPage />} /> */}
//         <Route path="/test/createmeeting" element={<CreateMeetingPage />} />
//         <Route path="/test/video/:roomID" element={<VideoConference />} />
//       </Routes>
//       <Footer/>
//     </>
//     // </Router>
    
//   );
// }

// export default App;
