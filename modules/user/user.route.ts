import express from "express";
const router = express.Router();

import {
  uploadAvt,
  changeUsername,
  searchUser,
  fetchUserById,
} from "./user.controller";

router.get("/:id", fetchUserById);

router.post("/upload", uploadAvt);
router.post("/change-user-name", changeUsername);
router.post("/search", searchUser);

export default router;
