import { Router } from "express";
import { loginUser,logoutUser,registerUser,refreshAccessToken} from "../controllers/user.controller.js";
import { validateUser,verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(validateUser,registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
export default router