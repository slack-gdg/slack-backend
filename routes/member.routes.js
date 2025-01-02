import { Router } from "express";
import {
  getWorkspacesByMemberId,
  addMemberToWorkspace,
  deleteMemberFromWorkspace,
  getConversationsByParticipant,
} from "../controllers/member.controller.js";

const router = Router();

router.route("/all/member/:userId").get(getWorkspacesByMemberId);
router.route("/member/add/:workspaceId").post(addMemberToWorkspace);
router.route("/member/delete/:workspaceId/:memberId").delete(deleteMemberFromWorkspace);
router.route("/member/conversations/:memberId/").get(getConversationsByParticipant);

export default router;
