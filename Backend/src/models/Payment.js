import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: "USD" 
    },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed", "refunded"], 
      default: "completed" // Simulado siempre exitoso
    },
    paymentMethod: { 
      type: String, 
      default: "simulated" 
    },
    transactionId: { 
      type: String, 
      required: true 
    },
    paymentDate: { 
      type: Date, 
      default: Date.now 
    },
    // Datos simulados del pago
    cardLastFour: { 
      type: String 
    },
    cardBrand: { 
      type: String, 
      default: "simulated" 
    }
  },
  { timestamps: true }
);

// Índices para optimizar consultas
paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
