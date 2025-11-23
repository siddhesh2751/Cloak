import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const credentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    failedLogins: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, versionKey: false }
);

credentialSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

credentialSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

credentialSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { userId: this.userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXP }
  );
};

credentialSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { userId: this.userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXP }
  );
};

export default mongoose.model("Credential", credentialSchema);
