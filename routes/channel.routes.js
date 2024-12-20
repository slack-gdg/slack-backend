import { Router } from "express";
import { createChannel,getAllChannels,getChannelUsingId,updateChannel,deleteChannel} from "../controllers/channel.controller.js";
const router=Router()
router.route("/create-channel").post(createChannel)
router.route("/").get(getAllChannels)
router.route("/:id").get(getChannelUsingId)
router.route("/update-channel/:id").put(updateChannel)
router.route("/delete-channel/:id").delete(deleteChannel)
export default router