import mongoose from "mongoose";

const UserCourseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  status: { type: String, default: "active" },
  progress: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  completedLessons: { type: Number, default: 0 },
  completedLessonsIds: { type: [Number], default: [] },
  paymentStatus: { type: String, default: "paid" }
});

const UserCourse = mongoose.model("UserCourse", UserCourseSchema);
export default UserCourse;