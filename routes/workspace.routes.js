import { Router } from "express";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceUsingId,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspace.controller.js";
const router = Router();
router.route("/create-workspace").post(createWorkspace);
router.route("/").get(getAllWorkspaces);
router.route("/:id").get(getWorkspaceUsingId);
router.route("/update-workspace/:id").put(updateWorkspace);
router.route("/delete-workspace/:id").delete(deleteWorkspace);
export default router;
