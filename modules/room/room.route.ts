import express from "express";
const router = express.Router();

import { fetchMessages, fetchRooms } from "./room.controller";

router.get("/:user_id", fetchRooms);
router.get("/messages/:room_id", fetchMessages);

export default router;
