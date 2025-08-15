// src/pages/MeetingSFUPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMediasoup from '../hooks/useMediasoup';
import api from '../services/api';
import { socket } from '../socket';
import { useAuth } from '../context/AuthContext';

export default function MeetingSFUPage() {
  const { meetingId } = useParams();
  const { currentUser } = useAuth();
  const nav = useNavigate();
  const localVideoRef = useRef(null);
  const { initDevice, createSendTransport, produceTrack, getProducers, consume, setJoined } = useMediasoup({ roomId: meetingId });
  const [remoteStreams, setRemoteStreams] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      nav('/login');
      return;
    }
    let mounted = true;

    (async () => {
      try {
        // ensure server registers you in DB and socket room (optional)
        await api.post(`/api/meetings/${meetingId}/join`, { username: currentUser.username });

        // init mediasoup device
        await initDevice();
        const sendTransport = await createSendTransport();

        // get local stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // produce audio & video
        for (const track of stream.getTracks()) {
          await produceTrack(track);
        }

        // fetch existing producers and consume them
        const { producers } = await new Promise((resolve) => {
          socket.emit('mediasoup:getProducers', { roomId: meetingId }, resolve);
        });

        for (const p of producers) {
          // p.producerId
          const onTrack = ({ id, stream: s }) => {
            setRemoteStreams(prev => {
              if (prev.some(r => r.id === id)) return prev;
              return [...prev, { id, stream: s }];
            });
          };
          await consume({ producerId: p.producerId, onTrack });
        }

        // listen for future producers
        socket.on('mediasoup:producerAdded', async ({ producerId }) => {
          const onTrack = ({ id, stream: s }) => {
            setRemoteStreams(prev => {
              if (prev.some(r => r.id === id)) return prev;
              return [...prev, { id, stream: s }];
            });
          };
          await consume({ producerId, onTrack });
        });

        socket.on('mediasoup:producerRemoved', ({ producerId }) => {
          setRemoteStreams(prev => prev.filter(r => r.producerId !== producerId && r.id !== producerId));
        });

        setJoined(true);
      } catch (err) {
        console.error('SFU init error', err);
        alert('Could not join SFU: ' + err.message);
        nav('/');
      }
    })();

    return () => {
      socket.off('mediasoup:producerAdded');
      socket.off('mediasoup:producerRemoved');
      try { socket.emit('mediasoup:leave', { roomId: meetingId }); } catch(e) {}
    };
  }, [meetingId, currentUser]);

  const leave = async () => {
    try {
      await api.post(`/api/meetings/${meetingId}/leave`, { username: currentUser.username });
    } catch (e) { console.warn(e); }
    try { socket.emit('mediasoup:leave', { roomId: meetingId }); } catch (e) {}
    nav('/');
  };

  const endMeeting = async () => {
    try {
      await api.post(`/api/meetings/${meetingId}/end`);
      socket.emit('mediasoup:endMeeting', { roomId: meetingId });
      nav('/');
    } catch (e) { console.warn(e); alert('End failed'); }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Meeting (SFU): {meetingId}</h2>
      <div style={{ display:'flex', gap: 12 }}>
        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 300 }} />
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {remoteStreams.map(r => (
            <video key={r.id} autoPlay playsInline style={{ width: 240 }} ref={el => { if (el) el.srcObject = r.stream; }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={leave}>Leave</button>
        <button onClick={endMeeting} style={{ marginLeft: 8 }}>End Meeting (host)</button>
      </div>
    </div>
  );
}
