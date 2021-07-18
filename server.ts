import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import cloudinary from "cloudinary";
import connectToDb from "./util/mongodb";
require("dotenv").config();

import { getDbInstance } from "./util/mongodb";

import userRoute from "./modules/user/user.route";
import roomRoute from "./modules/room/room.route";
import { Db, ObjectId } from "mongodb";

const PORT = process.env.PORT || 5000;
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

app.use("/api/users", userRoute);
app.use("/api/rooms", roomRoute);

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
});

io.on("connection", (socket: Socket) => {
  // socket.on("disconnect", (reason) => {
  //   console.log(reason);
  // });
  // socket.on("private msg", ({ content }) => {
  //   console.log(content);
  //   getDbInstance().collection("chats").insertOne({});
  // });
  socket.on("join room", (room_id) => {
    socket.join(room_id);
  });

  socket.on("typing", ({ room_id, image }) => {
    socket.to(room_id).emit("typing", { image });
  });

  socket.on("blur", ({ room_id, image }) => {
    socket.to(room_id).emit("blur", { image });
  });

  socket.on("message", async ({ content, sender_id, room_id }) => {
    const db: Db = getDbInstance();
    const present = new Date();
    const newMessage = await db.collection("chats").insertOne({
      room_id,
      content,
      sender_id,
      createdAt: present,
    });
    const updatedRoom = await db.collection("rooms").findOneAndUpdate(
      { _id: new ObjectId(room_id) },
      {
        $set: { last_msg: content, last_date_msg: present },
      },
      {
        returnDocument: "after",
      }
    );
    const message_id = newMessage.insertedId;

    io.in(room_id).emit("new message", updatedRoom.value);

    io.in(room_id).emit("message", {
      _id: message_id,
      room_id,
      content,
      sender_id,
      createdAt: present,
    });
  });
  // console.log(socket.id);
});

connectToDb()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log("Error when connect to db", err);
  });

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
