import { Router } from "express";
import {
  getWorkspacesByMemberId,
  addMemberToWorkspace,
  deleteMemberFromWorkspace,
  getConversationsByParticipant,
} from "../controllers/member.controller.js";

const router = Router();

router.route("/all/:userId").get(getWorkspacesByMemberId);
router.route("/add/:workspaceId").post(addMemberToWorkspace);
router.route("/delete/:workspaceId/:memberId").delete(deleteMemberFromWorkspace);
router.route("/conversations/:memberId/").get(getConversationsByParticipant);

export default router;
