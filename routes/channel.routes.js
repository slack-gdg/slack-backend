import { Router } from "express";
import {
  createChannel,
  getAllChannels,
  getChannelUsingId,
  updateChannel,
  deleteChannel,
} from "../controllers/channel.controller.js";
const router = Router();
router.route("/create/:workspaceId").post(createChannel);
router.route("/:id").get(getChannelUsingId);
router.route("/all/:workspaceId").get(getAllChannels);
router.route("/update/:id").put(updateChannel);
router.route("/delete/:id").delete(deleteChannel);
export default router;
