import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  bio: { type: String },
  image: { type: String }
});

const Instructor = mongoose.models.Instructor || mongoose.model("Instructor", instructorSchema);

export default Instructor;
