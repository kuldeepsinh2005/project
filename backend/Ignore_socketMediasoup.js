// backend/socketMediasoup.js
const mediasoupService = require('./services/mediasoupService');
const { rooms } = mediasoupService;

module.exports = function initSocketIo(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('mediasoup:join', async ({ roomId }, callback) => {
      try {
        // ensure router exists and return its RTP capabilities
        const router = await mediasoupService.getOrCreateRouter(roomId);
        socket.join(roomId);

        // remember that this socket is associated with this room
        callback({ rtpCapabilities: router.rtpCapabilities });
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    // client asks server to create a transport to send or receive
    socket.on('mediasoup:createTransport', async ({ roomId }, callback) => {
      try {
        const transport = await mediasoupService.createWebRtcTransport(roomId);

        // store transport in room map
        const room = rooms.get(roomId);
        if (!room.transports.has(socket.id)) room.transports.set(socket.id, new Map());
        room.transports.get(socket.id).set(transport.id, transport);

        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters
        });
      } catch (err) {
        console.error('createTransport err', err);
        callback({ error: err.message });
      }
    });

    // client connects transport (DTLS)
    socket.on('mediasoup:connectTransport', async ({ roomId, transportId, dtlsParameters }, callback) => {
      try {
        const room = rooms.get(roomId);
        const transport = room?.transports?.get(socket.id)?.get(transportId);
        if (!transport) throw new Error('Transport not found');
        await transport.connect({ dtlsParameters });
        callback({ ok: true });
      } catch (err) {
        console.error('connectTransport err', err);
        callback({ error: err.message });
      }
    });

    // client produces a track
    socket.on('mediasoup:produce', async ({ roomId, transportId, kind, rtpParameters }, callback) => {
      try {
        const room = rooms.get(roomId);
        const transport = room.transports.get(socket.id).get(transportId);
        const producer = await transport.produce({ kind, rtpParameters });

        room.producers.set(producer.id, { producer, socketId: socket.id });

        // notify other peers in the room about the new producer (they will call consume)
        socket.to(roomId).emit('mediasoup:producerAdded', { producerId: producer.id, kind });

        callback({ id: producer.id });
      } catch (err) {
        console.error('produce err', err);
        callback({ error: err.message });
      }
    });

    // client wants to consume a given producer
    socket.on('mediasoup:consume', async ({ roomId, producerId, rtpCapabilities }, callback) => {
      try {
        const room = rooms.get(roomId);
        const router = room.router;
        // can the router consume the producer with this rtpCapabilities?
        if (!router.canConsume({ producerId, rtpCapabilities })) {
          return callback({ error: 'cannot consume' });
        }
        // create recv transport if needed
        // we'll create a plain transport for consuming (many architectures use the same transport)
        const transport = await mediasoupService.createWebRtcTransport(roomId);
        // store this transport for the socket
        if (!room.transports.has(socket.id)) room.transports.set(socket.id, new Map());
        room.transports.get(socket.id).set(transport.id, transport);

        // connect transport? client will call connect with DTLS later; return transport params now
        // create consumer on server side
        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: false
        });

        // track consumer for cleanup
        if (!room.consumers.has(socket.id)) room.consumers.set(socket.id, new Set());
        room.consumers.get(socket.id).add(consumer.id);

        callback({
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          transportId: transport.id
        });
      } catch (err) {
        console.error('consume err', err);
        callback({ error: err.message });
      }
    });

    socket.on('mediasoup:getProducers', ({ roomId }, callback) => {
      try {
        const room = rooms.get(roomId);
        const producers = [];
        if (room && room.producers.size) {
          for (const [prodId, { producer, socketId }] of room.producers) {
            producers.push({ producerId: prodId, socketId, kind: producer.kind });
          }
        }
        callback({ producers });
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    socket.on('mediasoup:leave', async ({ roomId }, callback) => {
      try {
        const room = rooms.get(roomId);
        if (room) {
          // close & remove transports, producers, consumers belonging to this socket
          const transportsMap = room.transports.get(socket.id);
          if (transportsMap) {
            for (const transport of transportsMap.values()) {
              try { transport.close(); } catch (e) {}
            }
            room.transports.delete(socket.id);
          }

          // remove producers
          for (const [prodId, info] of room.producers) {
            if (info.socketId === socket.id) {
              try { info.producer.close(); } catch (e) {}
              room.producers.delete(prodId);
              socket.to(roomId).emit('mediasoup:producerRemoved', { producerId: prodId });
            }
          }

          // remove consumers
          room.consumers.delete(socket.id);

          socket.leave(roomId);
        }
        callback({ ok: true });
      } catch (err) {
        console.error('leave err', err);
        callback({ error: err.message });
      }
    });

    socket.on('disconnect', () => {
      // best-effort cleanup: iterate rooms and remove entries for this socket
      for (const [roomId, room] of rooms.entries()) {
        if (room.transports.has(socket.id)) {
          const transportsMap = room.transports.get(socket.id);
          for (const t of transportsMap.values()) try { t.close(); } catch (e) {}
          room.transports.delete(socket.id);
        }
        for (const [prodId, info] of room.producers) {
          if (info.socketId === socket.id) {
            try { info.producer.close(); } catch (e) {}
            room.producers.delete(prodId);
            socket.to(roomId).emit('mediasoup:producerRemoved', { producerId: prodId });
          }
        }
        room.consumers.delete(socket.id);
      }
      console.log('Socket disconnected', socket.id);
    });
    
    socket.on('mediasoup:endMeeting', async ({ roomId }) => {
        try {
            const room = rooms.get(roomId);
            if (!room) return;
            // close producers & transports & router
            for (const [prodId, info] of room.producers) {
            try { info.producer.close(); } catch(e){}
            }
            for (const [socketId, transportsMap] of room.transports) {
            for (const t of transportsMap.values()) try { t.close(); } catch(e){}
            }
            // notify clients
            io.to(roomId).emit('mediasoup:meetingEnded', { roomId });
            // remove room
            try { await room.router.close(); } catch(e){}
            rooms.delete(roomId);
        } catch (err) {
            console.error('endMeeting err', err);
        }
    });

  });
  
};
