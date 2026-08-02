require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { initSocket } = require("./sockets");

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || "*" } });

initSocket(io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 EventOS backend running on port ${PORT}`);
});