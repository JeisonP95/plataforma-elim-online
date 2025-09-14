import UserCourse from "../models/UserCourse.js";
import Payment from "../models/Payment.js";
import Course from "../models/Courses.js";
import User from "../models/User.js";

// Inscribir usuario en un curso (con pago simulado)
export const enrollUser = async (req, res) => {
  try {
    const { courseId, paymentData } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ message: "Se requiere el ID del curso" });
    }

    // Verificar que el curso existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Verificar que el usuario no esté ya inscrito
    const existingEnrollment = await UserCourse.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(409).json({ message: "Ya estás inscrito en este curso" });
    }

    // Generar ID de transacción simulado
    const transactionId = `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crear registro de pago simulado
    const payment = new Payment({
      userId,
      courseId,
      amount: course.price || 0,
      currency: course.currency || "USD",
      status: "completed",
      paymentMethod: "simulated",
      transactionId,
      cardLastFour: paymentData?.cardNumber?.slice(-4) || "****",
      cardBrand: "simulated"
    });

    await payment.save();

    // Crear inscripción del usuario en el curso
    const userCourse = new UserCourse({
      userId,
      courseId,
      status: "active",
      progress: 0,
      paymentStatus: "paid",
      totalLessons: course.lessons || 0,
      completedLessons: 0
    });

    await userCourse.save();

    // Actualizar el modelo User para mantener compatibilidad
    const user = await User.findById(userId);
    if (user) {
      // Agregar a enrolledCourses si no existe
      const alreadyInEnrolled = user.enrolledCourses.some(ec => ec.course.toString() === courseId);
      if (!alreadyInEnrolled) {
        user.enrolledCourses.push({
          course: courseId,
          progress: 0,
          completed: false,
          enrolledAt: new Date(),
          lastAccessed: new Date()
        });
        await user.save();
      }
    }

    res.status(201).json({
      message: "Inscripción exitosa",
      enrollment: {
        id: userCourse._id,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          image: course.image,
          price: course.price
        },
        progress: userCourse.progress,
        status: userCourse.status,
        enrolledAt: userCourse.enrolledAt
      },
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status
      }
    });

  } catch (error) {
    console.error("Error en enrollUser:", error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Obtener cursos del usuario con progreso
export const getUserCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const userCourses = await UserCourse.find({ userId })
      .populate('courseId', 'title description image price currency duration lessons rating instructor category level totalHours')
      .sort({ enrolledAt: -1 });

    if (!userCourses || userCourses.length === 0) {
      return res.json({ 
        message: "No estás inscrito en ningún curso",
        courses: [] 
      });
    }

    const coursesWithProgress = userCourses.map(uc => ({
      id: uc._id,
      course: {
        id: uc.courseId._id,
        title: uc.courseId.title,
        description: uc.courseId.description,
        image: uc.courseId.image,
        price: uc.courseId.price,
        currency: uc.courseId.currency,
        duration: uc.courseId.duration,
        lessons: uc.courseId.lessons,
        rating: uc.courseId.rating,
        instructor: uc.courseId.instructor,
        category: uc.courseId.category,
        level: uc.courseId.level,
        totalHours: uc.courseId.totalHours
      },
      progress: uc.progress,
      status: uc.status,
      enrolledAt: uc.enrolledAt,
      completedAt: uc.completedAt,
      lastAccessed: uc.lastAccessed,
      totalLessons: uc.totalLessons,
      completedLessons: uc.completedLessons,
      paymentStatus: uc.paymentStatus,
      notes: uc.notes,
      rating: uc.rating,
      review: uc.review
    }));

    res.json({
      message: "Cursos obtenidos exitosamente",
      courses: coursesWithProgress,
      total: coursesWithProgress.length
    });

  } catch (error) {
    console.error("Error en getUserCourses:", error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Actualizar progreso de un curso
export const updateCourseProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, completedLessons, notes } = req.body;
    const userId = req.user._id;

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({ message: "El progreso debe estar entre 0 y 100" });
    }

    // Verificar que el curso pertenece al usuario
    const userCourse = await UserCourse.findOne({ _id: id, userId });
    if (!userCourse) {
      return res.status(404).json({ message: "Curso no encontrado o no tienes acceso" });
    }

    // Actualizar campos
    if (progress !== undefined) {
      userCourse.progress = Math.min(100, Math.max(0, progress));
    }
    if (completedLessons !== undefined) {
      userCourse.completedLessons = completedLessons;
    }
    if (notes !== undefined) {
      userCourse.notes = notes;
    }

    // Recalcular progreso basado en lecciones completadas si no se proporciona
    if (progress === undefined && completedLessons !== undefined && userCourse.totalLessons > 0) {
      userCourse.progress = Math.round((completedLessons / userCourse.totalLessons) * 100);
    }

    await userCourse.save();

    // Actualizar también el modelo User para mantener compatibilidad
    const user = await User.findById(userId);
    if (user) {
      const enrolledCourse = user.enrolledCourses.find(ec => ec.course.toString() === userCourse.courseId.toString());
      if (enrolledCourse) {
        enrolledCourse.progress = userCourse.progress;
        enrolledCourse.completed = userCourse.progress >= 100;
        enrolledCourse.lastAccessed = new Date();
        await user.save();
      }
    }

    res.json({
      message: "Progreso actualizado exitosamente",
      enrollment: {
        id: userCourse._id,
        progress: userCourse.progress,
        completedLessons: userCourse.completedLessons,
        status: userCourse.status,
        lastAccessed: userCourse.lastAccessed
      }
    });

  } catch (error) {
    console.error("Error en updateCourseProgress:", error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Obtener detalles de un curso específico del usuario
export const getUserCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const userCourse = await UserCourse.findOne({ _id: id, userId })
      .populate('courseId', 'title description image price currency duration lessons rating instructor category level totalHours');

    if (!userCourse) {
      return res.status(404).json({ message: "Curso no encontrado o no tienes acceso" });
    }

    res.json({
      message: "Detalles del curso obtenidos exitosamente",
      enrollment: {
        id: userCourse._id,
        course: {
          id: userCourse.courseId._id,
          title: userCourse.courseId.title,
          description: userCourse.courseId.description,
          image: userCourse.courseId.image,
          price: userCourse.courseId.price,
          currency: userCourse.courseId.currency,
          duration: userCourse.courseId.duration,
          lessons: userCourse.courseId.lessons,
          rating: userCourse.courseId.rating,
          instructor: userCourse.courseId.instructor,
          category: userCourse.courseId.category,
          level: userCourse.courseId.level,
          totalHours: userCourse.courseId.totalHours
        },
        progress: userCourse.progress,
        status: userCourse.status,
        enrolledAt: userCourse.enrolledAt,
        completedAt: userCourse.completedAt,
        lastAccessed: userCourse.lastAccessed,
        totalLessons: userCourse.totalLessons,
        completedLessons: userCourse.completedLessons,
        paymentStatus: userCourse.paymentStatus,
        notes: userCourse.notes,
        rating: userCourse.rating,
        review: userCourse.review
      }
    });

  } catch (error) {
    console.error("Error en getUserCourseDetails:", error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};
