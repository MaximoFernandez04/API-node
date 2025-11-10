import mongoose from "mongoose";

const orderModel = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    fecha: {
      type: Date,
      default: Date.now
    },

    metodoPago: {
      type: String,
      enum: ["Transferencia", "Efectivo", "Tarjeta"],
      required: true
    },

    estado: {
      type: String,
      enum: ["Pendiente", "En preparación", "Enviado", "Entregado", "Cancelado"],
      default: "Pendiente"
    },

    total: {
      type: Number,
      required: true
    },

    items: [
      {
        producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1
        },
        subtotal: {
          type: Number,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true 
  }
);

export const Order = mongoose.model("orders", orderModel);