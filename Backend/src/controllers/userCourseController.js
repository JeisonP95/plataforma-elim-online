import UserCourse from "../models/UserCourse.js";

export const completeLesson = async (req,res) => {
  try{
    const { userCourseId, lessonId } = req.params;
    const userCourse = await UserCourse.findById(userCourseId);
    if(!userCourse) return res.status(404).json({ error:"UserCourse no encontrado" });

    const lessonIdNum = parseInt(lessonId,10);
    if(!userCourse.completedLessonsIds.includes(lessonIdNum)){
      userCourse.completedLessonsIds.push(lessonIdNum);
      userCourse.completedLessons = userCourse.completedLessonsIds.length;
      userCourse.progress = Math.round((userCourse.completedLessons / userCourse.totalLessons)*100);
      await userCourse.save();
    }

    res.json({ success:true, message:"Lección completada", userCourse });

  } catch(err){
    console.error(err);
    res.status(500).json({ error:"Error actualizando lección" });
  }
};

export const getUserCourses = async (req,res) => {
  try{
    const { userId } = req.params;
    const courses = await UserCourse.find({ userId }).populate("courseId");
    res.json({ success:true, courses });
  } catch(err){
    console.error(err);
    res.status(500).json({ error:"Error obteniendo cursos del usuario" });
  }
};
