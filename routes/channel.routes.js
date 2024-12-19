import { Router } from "express";
import { createChannel,getChannelMembers,getAllChannels,getChannelUsingId,addMemberToChannel,updateChannel,deleteChannel,deleteMemberFromChannel } from "../controllers/channel.controller.js";
const router=Router()
router.route("/create-channel").post(createChannel)
router.route("/get-Channel-Members/:userId").get(getChannelMembers)
router.route("/").get(getAllChannels)
router.route("/:id").get(getChannelUsingId)
router.route("/:channelId/members").post(addMemberToChannel)
router.route("/update-channel/:id").put(updateChannel)
router.route("/delete-channel/:id").delete(deleteChannel)
router.route("/:channelId/members/:memberId").delete(deleteMemberFromChannel)
export default router