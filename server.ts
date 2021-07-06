import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
});

// io.on("connection", (socket: Socket) => {
//   console.log(socket.id);
// });

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
