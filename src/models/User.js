const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["admin", "user", "sales", "dispatch", "quality_control", "production"],
    },
    enabled: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models["User"] || mongoose.model("User", UserSchema);
