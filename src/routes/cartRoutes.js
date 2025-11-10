import express from "express";
import { Cart } from "../models/cart.js";
import { addCart } from "../controllers/cartController.js";
import { authenticateToken } from "../services/auth.service.js";

export const cartRoutes = express.Router();

cartRoutes.post("/", authenticateToken, async (req, res) => {
  try {
    const { usuarioId, productId, cantidad } = req.body;
    const cart = await addCart(usuarioId, productId, cantidad);
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

cartRoutes.get("/:usuarioId", async(req, res)=>{
  try {
    const {usuarioId} = req.params;

    const cart = await Cart.findOne({usuarioId}).populate("items.productoId")


    if(!cart){
      res.status(404).json({message: "Carrito no encontrado"})
    }

    const productos = cart.items.map((item)=>({
      id: item.productoId._id,
      nombre: item.productoId.nombre,
      precioUnitario: item.productoId.precio,
      cantidad: item.cantidad
      //subtotal: item.productoId.precio * item.cantidad
      
    }))

     res.status(200).json({usuarioId, productos});
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito", error });
  }
})




cartRoutes.get("/:usuarioId/total", async(req, res)=>{
try {
   const{usuarioId} = req.params;

  const cart = await Cart.findOne({usuarioId}).populate("items.productoId")

  const productos = cart.items.filter((item)=> item.productoId).map((item)=>({
    id: item.productoId._id,
    nombre: item.productoId.nombre,
    subtotal: item.productoId.precio * item.cantidad
  }))

  let total = 0
  productos.forEach(element => {
    total += element.subtotal
  });

  res.status(200).json({usuarioId, productos, total});
  if(!cart){
      res.status(404).json({message: "Carrito no encontrado"})
    }
} catch (error) {
  res.status(500).json({ message: "Error al obtener el carrito", error });
}
 


})