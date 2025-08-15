// src/hooks/useMediasoup.js
import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket'; // your socket.io client
import * as mediasoupClient from 'mediasoup-client';

const STUN = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function useMediasoup({ roomId, onNewConsumer }) {
  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportsRef = useRef({}); // transportId -> transport
  const producersRef = useRef({});
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    // Ensure socket connected
    if (!socket.connected) socket.connect();

    return () => {
      // cleanup socket listeners on unmount
    };
  }, [roomId]);

  async function initDevice() {
    return new Promise((resolve, reject) => {
      socket.emit('mediasoup:join', { roomId }, async (res) => {
        if (res?.error) return reject(new Error(res.error));
        const routerRtpCapabilities = res.rtpCapabilities;
        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities });
        deviceRef.current = device;
        resolve(device);
      });
    });
  }

  async function createSendTransport() {
    return new Promise((resolve, reject) => {
      socket.emit('mediasoup:createTransport', { roomId }, async (res) => {
        if (res?.error) return reject(new Error(res.error));
        const device = deviceRef.current;
        const transport = device.createSendTransport({
          id: res.id,
          iceParameters: res.iceParameters,
          iceCandidates: res.iceCandidates,
          dtlsParameters: res.dtlsParameters
        });

        transport.on('connect', ({ dtlsParameters }, callback, errback) => {
          socket.emit('mediasoup:connectTransport', { roomId, transportId: res.id, dtlsParameters }, (r) => {
            if (r?.error) return errback(r.error);
            callback();
          });
        });

        transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
          socket.emit('mediasoup:produce', { roomId, transportId: res.id, kind, rtpParameters }, (r) => {
            if (r?.error) return errback(r.error);
            callback({ id: r.id });
          });
        });

        sendTransportRef.current = transport;
        resolve(transport);
      });
    });
  }

  async function produceTrack(track) {
    if (!sendTransportRef.current) throw new Error('sendTransport not created');
    const producer = await sendTransportRef.current.produce({ track });
    producersRef.current[producer.id] = producer;
    return producer;
  }

  async function getProducers() {
    return new Promise((resolve) => {
      socket.emit('mediasoup:getProducers', { roomId }, (res) => {
        resolve(res.producers || []);
      });
    });
  }

  async function consume({ producerId, onTrack }) {
    // ask server to create consumer and receive transport + rtpParameters etc
    return new Promise((resolve, reject) => {
      socket.emit('mediasoup:consume', { roomId, producerId, rtpCapabilities: deviceRef.current.rtpCapabilities }, async (res) => {
        if (res?.error) return reject(new Error(res.error));

        // create recv transport for this consumer
        const transportRes = await new Promise((res2) => {
          // server returned transport details in consume response (we created a transport on server)
          res2({ id: res.transportId }); // note: in our simple server we created transport on consume, return id
        });

        // create transport locally to receive
        const recvTransport = deviceRef.current.createRecvTransport({
          id: transportRes.id,
          iceParameters: {}, // client will use connectTransport below if server provided ice params
          iceCandidates: [],
          dtlsParameters: {}
        });

        // connect transport (server expects DTLS connect): create minimal dtls parameters by calling server connect? 
        // NOTE: In our server code, we created transport on server and did not set up connect; client should call connectTransport with dtls params
        recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          socket.emit('mediasoup:connectTransport', { roomId, transportId: transportRes.id, dtlsParameters }, (r) => {
            if (r?.error) return errback(r.error);
            callback();
          });
        });

        // create consumer on this transport
        const consumer = await recvTransport.consume({
          producerId: res.producerId,
          id: res.id,
          kind: res.kind,
          rtpParameters: res.rtpParameters
        });

        // create stream and call onTrack
        const stream = new MediaStream();
        stream.addTrack(consumer.track);

        // expose consumer so we can close later
        if (!recvTransportsRef.current[transportRes.id]) recvTransportsRef.current[transportRes.id] = {};
        recvTransportsRef.current[transportRes.id][consumer.id] = consumer;

        onTrack({ id: consumer.id, stream, producerId: res.producerId });
        resolve({ consumer, transportId: transportRes.id });
      });
    });
  }

  return {
    initDevice,
    createSendTransport,
    produceTrack,
    getProducers,
    consume,
    joined,
    setJoined
  };
}
