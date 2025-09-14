import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
// import Header from '../components/Header.jsx';
// import Footer from '../components/Footer.jsx';
import Starfield from '../components/Starfield.jsx';

const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// --- Video Player Modal (No changes) ---
const VideoPlayerModal = ({ recording, onClose }) => {
  if (!recording) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2138] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#6366f1]/20 overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-[#6366f1]/20">
          <h3 className="text-lg font-bold truncate">{recording.title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#6366f1]/20 flex items-center justify-center transition-colors">
            <Icon id="times" />
          </button>
        </div>
        <div className="p-4">
          <video src={recording.cloudinaryUrl} controls autoPlay className="w-full h-auto max-h-[70vh] rounded-lg"></video>
        </div>
      </div>
    </div>
  );
};

// --- NEW: Confirmation Modal for Deleting Recordings ---
const ConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2138] w-full max-w-sm rounded-2xl shadow-2xl border border-red-500/30 p-6 text-center">
                <Icon id="exclamation-triangle" className="text-4xl text-red-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
                <p className="text-[#e2e8f0]/70 mb-6">This action is irreversible. The recording will be permanently deleted.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function MyRecordingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  
  // --- State for Delete Confirmation ---
  const [recordingToDelete, setRecordingToDelete] = useState(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/recordings', { withCredentials: true });
        if (res.data.success) {
          setRecordings(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch recordings.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchRecordings();
  }, [isAuthenticated, authLoading]);

  // --- NEW: Function to handle the delete confirmation ---
  const handleDeleteConfirm = async () => {
    if (!recordingToDelete) return;

    try {
        await axios.delete(`http://localhost:5000/api/recordings/${recordingToDelete._id}`, { withCredentials: true });
        // Update the UI instantly by filtering out the deleted recording
        setRecordings(prev => prev.filter(rec => rec._id !== recordingToDelete._id));
    } catch (err) {
        setError("Failed to delete recording. Please try again.");
    } finally {
        // Close the modal
        setRecordingToDelete(null);
    }
  };

  const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return <div className="bg-[#0a0e17] min-h-screen flex items-center justify-center text-white">Loading recordings...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen">
      <Starfield />
      {/* <Header /> */}
      <main className="relative z-10 max-w-7xl mx-auto py-12 px-4 w-full">
        <h1 className="text-4xl font-['Orbitron'] font-bold mb-8 text-center">My Recordings</h1>

        {error && <p className="text-center text-red-400 mb-4">{error}</p>}

        {recordings.length === 0 && !loading && (
          <div className="text-center text-[#e2e8f0]/70 py-16">
            <Icon id="film" className="text-5xl mb-4" />
            <p>You haven't recorded any meetings yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => (
            <div key={rec._id} className="bg-[#1a2138]/80 backdrop-blur-sm border border-[#6366f1]/20 rounded-2xl p-5 flex flex-col justify-between hover:border-[#6366f1]/40 transition-all group">
              <div>
                <h2 className="text-lg font-bold truncate mb-2">{rec.title}</h2>
                <p className="text-sm text-[#e2e8f0]/70 mb-1">
                  Meeting Code: <span className="font-mono bg-[#0a0e17] px-1.5 py-0.5 rounded">{rec.meeting.code}</span>
                </p>
                 <p className="text-sm text-[#e2e8f0]/70">
                  Recorded: {new Date(rec.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-bold bg-[#0a0e17] px-2 py-1 rounded-full">
                  <Icon id="clock" className="mr-2" />
                  {formatDuration(rec.duration)}
                </span>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedRecording(rec)}
                      className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                      <Icon id="play-circle" className="mr-2" />
                      Watch
                    </button>
                    {/* --- NEW: Delete Button --- */}
                    <button 
                      onClick={() => setRecordingToDelete(rec)}
                      className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg text-sm font-medium transition"
                    >
                      <Icon id="trash-alt" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {/* <Footer /> */}
      <VideoPlayerModal recording={selectedRecording} onClose={() => setSelectedRecording(null)} />
      {/* --- NEW: Render Confirmation Modal --- */}
      {recordingToDelete && <ConfirmationModal onConfirm={handleDeleteConfirm} onCancel={() => setRecordingToDelete(null)} />}
    </div>
  );
}


