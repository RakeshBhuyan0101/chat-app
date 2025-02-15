import { Router } from "express";
import { signin, signup , logout, cheackAuth, updateProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";
const router = Router()

router.route("/signup").post(signup)
router.route("/signin").post(signin)
router.route("/logout").post(logout)

router.route("/check" ).get(authMiddleware , cheackAuth)
router.route("/update-profile" ).put(authMiddleware , upload.single("profilePic") , updateProfile)
export default router