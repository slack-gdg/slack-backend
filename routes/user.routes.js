import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserChannels,
} from "../controllers/user.controller.js";

import { validateUser, verifyJWT } from "../middlewares/auth.middleware.js";

//~ auth controller
const router = Router();
router.route("/register").post(validateUser, registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

//~ user controller
router.route("/").get(getAllUsers);
router.route("/:id").get(getUserById);
router.route("/:id").put(updateUser);
router.route("/:id").delete(deleteUser);
router.route("/:userId/channels").get(getUserChannels);

export default router;
