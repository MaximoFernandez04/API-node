import express from "express";
import { createReview } from "../controllers/reviewController.js";
import { authenticateToken } from "../services/auth.service.js";
import { Review } from "../models/reviews.js";

export const reviewRoutes = express.Router();

reviewRoutes.post("/",authenticateToken, async(req,res)=>{
    try {
        const {usuarioId, productoId, comentario,rating} = req.body;
        if (!usuarioId || !productoId){
            res.status(400).json({mesagge : ' algunos de los parametros estan faltando'});
        } 
        const newReview = await createReview(usuarioId, productoId, comentario,rating);
        
        console.log(newReview)
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get de users: ${error}`})
    }
})

reviewRoutes.get("/top", async(req, res)=>{
  try {
    const topReviews = await Review.aggregate([
      {
        $group: {
          _id: "$producto", 
          promedio: { $avg: "$rating" },
          totalResenas: { $sum: 1 } 
        }
      },
      {
        $sort: { promedio: -1 } 
      },
      {
        $lookup: {
          from: "products", 
          localField: "_id",
          foreignField: "_id",
          as: "producto"
        }
      },
      {
        $unwind: "$producto"
      },
      {
        $project: {
          _id: 0,
          productoId: "$producto._id",
          nombre: "$producto.nombre",
          promedio: 1,
          totalResenas: 1
        }
      }
    ]);

    res.json(topReviews);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener top productos", error: error.message });
  }
});


reviewRoutes.post("/", authenticateToken, async (req, res) => {
  const { productoId, calificacion, comentario } = req.body;
  const usuarioId = req.user.id;

  try {
    
    const compra = await Order.findOne({
      usuarioId,
      "items.productoId": productoId,
      estado: "enviado" 
    });

    if (!compra) {
      return res.status(403).json({ message: "No puedes reseñar un producto que no compraste" });
    }

    const nuevaResena = await Review.create({
      usuarioId,
      productoId,
      calificacion,
      comentario
    });

    res.status(201).json({
      message: "Reseña creada correctamente",
      reseña: nuevaResena
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear reseña", error: error.message });
  }
});

reviewRoutes.get("/:productId", authenticateToken, async(req, res)=>{
    try {
        const {productId} = req.params
        console.log(productId)
        if(!productId){
            res.status(400).json({mesagge : 'no existe ese id de    producto'});
         }

        const productReview = await Review.find({producto: productId}) .populate("producto", "nombre ")
        res.status(200).json(productReview);
    } catch (error) {
        res.status(500).json({ message: `Error al traer la review: ${error.message}` });
    }
    
});

//PATCH
reviewRoutes.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cambios = req.body;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    if (String(review.usuarioId) !== String(req.user.id) && req.user.rol !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    Object.assign(review, cambios);
    await review.save();

    res.status(200).json({ message: "Reseña actualizada", review });
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar reseña: ${error.message}` });
  }
});

//DELETE

reviewRoutes.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }
  
    const esPropietario = String(review.usuario) === String(req.user.id);
    const esAdmin = req.user.rol === "admin";
    
    if (!esPropietario && !esAdmin) {
      return res.status(403).json({ message: "No autorizado para eliminar esta reseña" });
    }
    
    const reviewEliminada = await Review.findByIdAndDelete(id);

    if (!reviewEliminada) {
      return res.status(404).json({ message: "No se pudo eliminar la reseña" });
    }

    res.status(200).json({ message: "Reseña eliminada correctamente" });

  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    res.status(500).json({
      message: `Error al eliminar la reseña: ${error?.message || "Error desconocido"}`
    });
  }
});
