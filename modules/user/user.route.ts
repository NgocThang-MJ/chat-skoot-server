import express from "express";
const router = express.Router();

import { uploadAvt } from "./user.controller";

router.post("/upload", uploadAvt);

export default router;
