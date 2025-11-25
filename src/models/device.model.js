import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    deviceId: { type: String, required: true, index: true },
    name: { type: String, default: "Unknown Device" },
    refreshTokenHash: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    revoked: { type: Boolean, default: false },
    userAgentHash: { type: String, default: "" },
    ipHashes: { type: [String], default: [] }
  },
  { timestamps: true, versionKey: false }
);

// ensure a user can have same deviceId only once
deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export default mongoose.model("Device", deviceSchema);
