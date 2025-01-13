import { Router } from "express";
import { broadcastMessage } from "../controllers/message.controller.js";

const router = Router();

router.route("/").post(broadcastMessage);

export default router