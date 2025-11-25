import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    attachments: {
      type: [String], // optional image URLs
      default: []
    },
    likes: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Post", postSchema);
