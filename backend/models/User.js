const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String },

    phone: { type: String, default: "" },

    joiningDate: { type: Date, default: null },

    avatar: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
