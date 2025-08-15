// backend/services/mediasoupService.js
const mediasoup = require('mediasoup');

const workers = [];
const rooms = new Map(); // roomId => { router, transports: Map(socketId->transport[]), producers: Map(producerId->{producer, socketId}), consumers: Map(socketId->Set(consumerId)) }

const config = {
  // tune these values if needed
  rtcMinPort: 10000,
  rtcMaxPort: 10100,
  // mediaCodecs must match client capabilities (opus + vp8)
  mediaCodecs: [
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
    { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
  ]
};

async function createWorker() {
  const worker = await mediasoup.createWorker({
    rtcMinPort: config.rtcMinPort,
    rtcMaxPort: config.rtcMaxPort,
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
  });

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting (please restart).');
    process.exit(1);
  });

  workers.push(worker);
  return worker;
}

async function getOrCreateRouter(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId).router;

  // ensure at least one worker exists
  const worker = workers.length ? workers[0] : await createWorker();
  const router = await worker.createRouter({ mediaCodecs: config.mediaCodecs });

  rooms.set(roomId, {
    router,
    transports: new Map(), // socketId => [transportId...]
    producers: new Map(),  // producerId => { producer, socketId }
    consumers: new Map()   // socketId => Set(consumerId)
  });

  return router;
}

async function createWebRtcTransport(roomId, options = {}) {
  const router = await getOrCreateRouter(roomId);
  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.PUBLIC_ANNOUNCED_IP || undefined }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000,
    ...options
  });

  return transport;
}

module.exports = {
  createWorker,
  getOrCreateRouter,
  createWebRtcTransport,
  rooms,
};
