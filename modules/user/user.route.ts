import express from "express";
const router = express.Router();

import { uploadAvt, changeUsername, searchUser } from "./user.controller";

router.post("/upload", uploadAvt);
router.post("/change-user-name", changeUsername);
router.post("/search", searchUser);

export default router;
