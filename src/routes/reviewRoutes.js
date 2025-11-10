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
    
})