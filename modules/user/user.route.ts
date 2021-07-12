import express from "express";
const router = express.Router();

import { uploadAvt, changeUsername } from "./user.controller";

router.post("/upload", uploadAvt);
router.post("/change-user-name", changeUsername);

export default router;
