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

// PATCH(admin)
categoryRoutes.patch("/:id", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const cambios = req.body;
    const categoriaActualizada = await Category.findByIdAndUpdate(id, cambios, { new: true });
    if (!categoriaActualizada) return res.status(404).json({ message: "Categoria no encontrada" });
    res.status(200).json({ message: "Categoria actualizada", categoria: categoriaActualizada });
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar categoria: ${error.message}` });
  }
});

// DELETE(admin)
categoryRoutes.delete("/:id", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaEliminada = await Category.findByIdAndDelete(id);
    if (!categoriaEliminada) return res.status(404).json({ message: "Categoria no encontrada" });
    res.status(200).json({ message: "Categoria eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: `Error al eliminar categoria: ${error.message}` });
  }
});