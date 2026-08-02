function initSocket(io) {
  // Socket.IO setup (auth, rooms, events) lands in Phase 6.
  io.on("connection", (socket) => {
    socket.emit("server:connected", { ok: true });
  });
}

module.exports = { initSocket };