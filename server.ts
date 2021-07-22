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

let onlineIds: string[] = [];

io.on("connection", (socket: Socket) => {
  socket.on("disconnect", () => {
    // console.log("disconnect");
    onlineIds = onlineIds.filter((id) => id !== socket.data.user_id);
    socket.to(socket.data.rooms).emit("leave room", socket.data.user_id);
  });
  // socket.on("private msg", ({ content }) => {
  //   console.log(content);
  //   getDbInstance().collection("chats").insertOne({});
  // });
  socket.on("join room", ({ ids, user_id }) => {
    socket.join(ids);
    socket.data.user_id = user_id;
    socket.data.rooms = ids;
    !onlineIds.includes(user_id) && onlineIds.push(user_id);
    io.to(ids).emit("joined room", onlineIds);
  });

  // socket.on("leave room", ({ ids, user_id }) => {
  //   console.log("leave room", user_id);
  //   onlineIds = onlineIds.filter((id) => id !== user_id);
  //   socket.to(ids).emit("leave room", user_id);
  // });

  socket.on("join conversation", (id) => {
    socket.join(id);
  });

  // socket.on("leave room", (room_socket_id) => {
  //   console.log("leave room");
  //   socket.leave(room_socket_id);
  // });

  // socket.on("typing", ({ room_socket_id, user_id }) => {
  //   socket.to(room_socket_id).emit("typing", { user_id });
  // });

  // socket.on("blur", ({ room_socket_id, user_id }) => {
  //   socket.to(room_socket_id).emit("blur", { user_id });
  // });

  socket.on(
    "message",
    async ({ content, sender_id, room_id, room_socket_id }) => {
      const db: Db = getDbInstance();
      const present = new Date();
      await db.collection("chats").insertOne({
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
      // const message_id = newMessage.insertedId;

      io.in(room_id).emit("new message", updatedRoom.value);

      socket.to(room_socket_id).emit("message", {
        // _id: message_id,
        // room_id,
        content,
        sender_id,
        // createdAt: present,
      });
    }
  );

  // Call
  socket.on(
    "call",
    ({ room_id, signal_data, name_caller, image_caller, socket_id }) => {
      socket.to(room_id).except(socket_id).emit("call", {
        signal_data,
        name_caller,
        image_caller,
        room_id,
      });
    }
  );

  socket.on("answer", ({ signal_data, room_id }) => {
    socket.to(room_id).emit("answer", signal_data);
  });

  socket.on("off call", (room_id) => {
    io.to(room_id).emit("off call");
  });

  socket.on("end call", (room_id) => {
    io.to(room_id).emit("end call");
  });

  socket.on("reject call", (room_id) => {
    socket.to(room_id).emit("reject call");
  });
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
