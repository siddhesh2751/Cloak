import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getFeed,
  getMyPosts
} from "../controllers/post.controller.js";
import { addComment, getComments } from "../controllers/comment.controller.js";

const router = Router();

// Posts
router.post("/", verifyAccessToken, createPost);
router.get("/feed", verifyAccessToken, getFeed);
router.get("/mine", verifyAccessToken, getMyPosts);

// Comments
router.post("/:postId/comments", verifyAccessToken, addComment);
router.get("/:postId/comments", verifyAccessToken, getComments);

export default router;
