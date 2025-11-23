import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 25
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("save", function (next) {
  if (this.isModified("username")) {
    this.username = this.username.toLowerCase();
  }
  next();
});

export default mongoose.model("User", userSchema);
