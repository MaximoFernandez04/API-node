import express from "express";
import { Product } from "../models/product.js";
import { createProduct } from "../controllers/productController.js";
import { verifyAdmin, authenticateToken } from "../services/auth.service.js";


export const productRoutes = express.Router();

productRoutes.post("/",authenticateToken,verifyAdmin, async(req,res)=>{
    try{
        const { nombre, descripcion, precio, stock, categoriaId } = req.body;
        if (!nombre){
            res.status(400).json({mesagge : ' algunos de los parametros estan faltando'});
        }
        const newProduct = await createProduct(nombre,descripcion,precio,stock,categoriaId);
        res.status(201).json(newProduct);
    }catch(error){
        res.status(500).json({mesagge: `Error en el get de users: ${error}`})
    }
})

productRoutes.get("/",async(req,res)=>{
    try {
        const product = await Product.find();
        if(product.length === 0){
            return res.status(204).json([])
        }
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({message: `Error en el get de users: ${error}`})
    }
})

productRoutes.get("/filter", async (req, res) => {
  try {
    const { producto, min, max } = req.query;

    const filtro = {};

    if (producto) {

      filtro.nombre = { $regex: producto, $options: "i" };
    }

    if (min || max) {
      filtro.precio = {};
      if (min) filtro.precio.$gte = Number(min);
      if (max) filtro.precio.$lte = Number(max);
    }

    const productos = await Product.find(filtro);
    console.log(productos);
    res.status(200).json(productos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error en el filtro de productos: ${error.message}` });
  }
});
//GET /api/productos/top → productos más reseñados
productRoutes.get("/top", async (req, res) => {
  try {
    const productosTop = await Product.aggregate([
      {
        $addFields: {
          totalReseñas: { $size: "$reseñas" } 
        }
      },
      { $sort: { totalReseñas: -1 } },
      { $limit: 5 } 
    ]);

    res.status(200).json(productosTop);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Error al obtener los productos más reseñados: ${error.message}`,
    });
  }
});
//PATCH /api/productos/:id/stock → actualizar stock.

productRoutes.patch("/:id/stock", authenticateToken,verifyAdmin,async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined) {
    return res.status(400).json({ message: "Debe enviar la cantidad de stock" });
  }

  try {
    const producto = await Product.findById(id);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    producto.stock = stock;
    await producto.save();

    res.json({
      message: "Stock actualizado correctamente",
      producto: {
        id: producto._id,
        nombre: producto.nombre,
        stock: producto.stock
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar stock ${error}`});
  }
});


