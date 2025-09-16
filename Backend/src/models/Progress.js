import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: String, required: true },
    tasks: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
