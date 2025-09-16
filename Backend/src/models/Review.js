import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", ReviewSchema);
export default Review;