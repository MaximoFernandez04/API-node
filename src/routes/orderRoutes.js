import express from "express";
import { authenticateToken, verifyAdmin } from "../services/auth.service.js";
import { createOrder } from "../controllers/orderController.js";
import { Order } from "../models/orders.js";

export const orderRoutes = express.Router();

orderRoutes.post("/", authenticateToken, async (req, res) => {
  try {
    const { usuario, metodoPago, items } = req.body;

    if (!usuario || !metodoPago || !items) {
      return res.status(400).json({ message: "Faltan algunos parámetros" });
    }

    const newOrder = await createOrder(usuario, metodoPago, items);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: `Error al crear el pedido: ${error.message}` });
  }
});

orderRoutes.get("/",authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const ordenes = await Order.find().populate("usuario", "nombre email");
    res.status(200).json(ordenes);
  } catch (error) {
    res.status(500).json({ message: `Error al obtener las órdenes: ${error.message}` });
  }
});


orderRoutes.patch("/:id/status", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ["Pendiente", "En preparación", "Enviado", "Entregado", "Cancelado"];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado inválido o faltante" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    )
    .populate("usuario", "nombre email")
    .populate("items.producto", "nombre precio");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.status(200).json({
      message: `Estado actualizado a '${estado}'`,
      order: updatedOrder
    });

  } catch (error) {
    res.status(500).json({ message: `Error al actualizar estado: ${error.message}` });
  }
});

orderRoutes.get("/stats", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$estado",
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          estado: "$_id",
          total: 1
        }
      }
    ]);

    res.status(200).json(stats);

  } catch (error) {
    res.status(500).json({ message: `Error al obtener estadísticas: ${error.message}` });
  }
});
