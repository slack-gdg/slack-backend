import { Router } from "express";
import { getChannelMembers ,addMemberToChannel,deleteMemberFromChannel} from "../controllers/member.controller.js";
const router=Router()
router.route("/get-Channel-Members/:userId").get(getChannelMembers)
router.route("/:channelId/members").post(addMemberToChannel)
router.route("/:channelId/members/:memberId").delete(deleteMemberFromChannel)
export default router