import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addComment = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { postId, content } = req.body;

  if (!content || content.trim() === "")
    throw new ApiError(400, "Comment cannot be empty");

  const comment = await Comment.create({
    postId,
    userId,
    content: content.trim()
  });

  // increment comment count in post
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added"));
});


export const getComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
  
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 });
  
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched"));
  });
  