import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    deviceId: {
      type: String,
      required: true
      // removed unique:true so user can have multiple devices
    },
    name: {
      type: String,
      default: "Unknown Device"
    },
    refreshTokenHash: {
      type: String,
      required: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    },
    revoked: {
      type: Boolean,
      default: false
    },
    userAgentHash: {
      type: String,
      default: ""
    },
    ipHashes: {
      type: [String],
      default: []
    }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Device", deviceSchema);
