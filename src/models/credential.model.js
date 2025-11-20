import mongoose from "mongoose";

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
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Credential", credentialSchema);
