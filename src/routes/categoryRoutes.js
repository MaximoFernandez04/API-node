import express from "express";
import {createCategory} from "../controllers/categoryController.js";
import { authenticateToken,verifyAdmin } from "../services/auth.service.js";
import { Category } from "../models/category.js";


export const categoryRoutes = express.Router(); 

categoryRoutes.post("/",authenticateToken, verifyAdmin, async(req,res)=>{
    try {
        const {nombre, descripcion} = req.body;
        if (!nombre) {
            res.status(400).json({mesagge : 'se debe colocar el nombre de la categoria'})
        }
        const newCategory =  await createCategory(nombre, descripcion);
        res.status(201).json(newCategory)
    } catch (error) {
        res.status(500).json({message: `Error en el get de categories: ${error}`})
    }
})

//GET /api/categorias/stats → cantidad de productos por categoría.
categoryRoutes.get("/stats", async(req,res)=>{
    try {
        const stats = await Category.aggregate([
            {
                $lookup:{
                    from:"products",
                    localField: "_id",
                    foreignField: "categoria",
                    as: "productos"
                },

            },
            {
                $project: {
                    _id: 0,
                    categoria: "$nombre",
                    cantidadProductos: { $size: "$productos" } 
                }
            }
        ])
        res.status(200).json(stats)
    } catch (error) {
        res.status(500).json({message: `Error en el get de categories: ${error}`})
    }
})