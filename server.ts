import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import upload from "express-fileupload";
import cloudinary from "cloudinary";
import database from "./util/mongodb";
require("dotenv").config();

import userRoute from "./modules/user/user.route";

const PORT = process.env.PORT || 5000;
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(upload());

app.use("/api/users", userRoute);

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

// export const db = database();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
});
// io.on("connection", (socket: Socket) => {
//   console.log(socket.id);
// });

database()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err, "Error when connect to db");
  });

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
