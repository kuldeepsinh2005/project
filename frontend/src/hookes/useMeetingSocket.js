import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useMeetingSocket({ meetingId, userId, username, onUserJoin, onUserLeave, onSignal }) {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to socket server');
      socketRef.current.emit('join-meeting', { meetingId, userId, username });
    });

    socketRef.current.on('user-joined', onUserJoin);
    socketRef.current.on('user-left', onUserLeave);
    socketRef.current.on('signal', onSignal);

    return () => {
      socketRef.current.emit('leave-meeting');
      socketRef.current.disconnect();
    };
  }, [meetingId, userId, username, onUserJoin, onUserLeave, onSignal]);

  // Function to send signal (WebRTC)
  const sendSignal = (to, data) => {
    socketRef.current.emit('signal', { to, data });
  };

  return { socket: socketRef.current, sendSignal };
}
