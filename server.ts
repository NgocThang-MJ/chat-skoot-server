import express from "express";
import { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import upload from "express-fileupload";
import cloudinary from "cloudinary";
import { MongoClient, ObjectId } from "mongodb";
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

interface RequestImage {
  name: string;
  data: string;
  userId: string;
  img_name: string;
}

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(upload());

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

app.post("/api/upload", async (req: Request, res: Response) => {
  try {
    const reqImg: RequestImage = req.body;
    const response = await cloudinary.v2.uploader.upload(reqImg.data, {
      public_id: `${reqImg.name.split(".")[0] + new Date().getMilliseconds()}`,
    });
    res.status(200).json(response);
    client
      .db(`${process.env.DB_NAME}`)
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.body.userId) },
        {
          $set: {
            image: response.url,
            image_name: response.public_id,
          },
        }
      );
    cloudinary.v2.uploader.destroy(reqImg.img_name);
  } catch (err) {
    console.log(err, "Error server");
    res.status(400).json({ msg: "Error" });
  }
});

app.get("/", async (req: Request, res: Response) => {
  const users = await client
    .db(`${process.env.DB_NAME}`)
    .collection("users")
    .find({})
    .toArray();
  console.log(users);
  res.json({ msg: "adsf" });
});

const client = new MongoClient(`${process.env.DB_URL}`, {
  useUnifiedTopology: true,
});
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
});
// io.on("connection", (socket: Socket) => {
//   console.log(socket.id);
// });

client.connect().then(() => console.log("connected to db"));

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
