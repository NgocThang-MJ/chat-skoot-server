import express from "express";
const router = express.Router();

import {
  uploadAvt,
  changeUsername,
  searchUser,
  fetchUserById,
  sendFriendRequest,
  approveFriendRequest,
} from "./user.controller";

router.get("/:id", fetchUserById);

router.post("/upload", uploadAvt);
router.post("/change-user-name", changeUsername);
router.post("/search", searchUser);
router.post("/friend-request", sendFriendRequest);
router.post("/approve-request", approveFriendRequest);

export default router;
