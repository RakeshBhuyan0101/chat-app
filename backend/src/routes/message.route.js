import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getMessages, getUserForSidebar, sendMessageDemo } from "../controllers/message.controller.js";
import upload from "../middleware/multer.js";
const router = Router()

router.route("/users").get(authMiddleware , getUserForSidebar)
router.route("/:id").get(authMiddleware , getMessages)
router.route("/send/:id").post(authMiddleware , upload.single("image"), sendMessageDemo)
export default router