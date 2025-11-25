import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Post from "../models/post.model.js";

export const createPost = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { content, attachments = [] } = req.body;

    if (!content || content.trim() === "")
        throw new ApiError(400, "Post content cannot be empty");

    const post = await Post.create({
        userId,
        content: content.trim(),
        attachments
    });

    return res
        .status(201)
        .json(new ApiResponse(201, post, "Post created successfully"));
});


export const getFeed = asyncHandler(async (req, res) => {
    const posts = await Post.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .select("-__v");

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "Feed fetched"));
});


export const getMyPosts = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const posts = await Post.find({ userId })
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "My posts"));
});

