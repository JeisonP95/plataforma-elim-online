import Payment from "../models/Payment.js";
import UserCourse from "../models/UserCourse.js";
import Course from "../models/Course.js";

export const createPayment = async (req,res) => {
  try{
    const { userId, courseId, amount, transactionId } = req.body;

    // Crear pago
    const payment = await Payment.create({ userId, courseId, amount, transactionId, status:"completed" });

    // Obtener totalLessons desde el curso real
    const course = await Course.findById(courseId);
    const totalLessons = course ? course.lessons : 4;

    // Crear o actualizar inscripción
    const userCourse = await UserCourse.findOneAndUpdate(
      { userId, courseId },
      { $setOnInsert: { status:"active", progress:0, totalLessons, completedLessons:0, paymentStatus:"paid" } },
      { upsert:true, new:true }
    );

    res.status(201).json({ success:true, payment, userCourse });

  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, error:"Error registrando pago" });
  }
};

export const getPayments = async (req,res) => {
  try{
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const payments = await Payment.find(filter).populate("userId courseId");
    res.json({ success:true, payments });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, error:"Error obteniendo pagos" });
  }
};
