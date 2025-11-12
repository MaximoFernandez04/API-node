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

//PATCH

cartRoutes.patch("/:usuarioId", authenticateToken, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { productoId, cantidad } = req.body;

    if (String(req.user.id) !== String(usuarioId) && req.user.rol !== "admin") {
      return res.status(403).json({ message: "No autorizado para modificar este carrito" });
    }

    const cart = await Cart.findOne({ usuarioId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => String(item.productoId) === String(productoId)
    );

    if (itemIndex > -1) {
      if (cantidad > 0) {
        cart.items[itemIndex].cantidad = cantidad;
      } else {
        
        cart.items.splice(itemIndex, 1);
      }
    } else {
      if (cantidad > 0) {
        cart.items.push({ productoId, cantidad });
      } else {
        return res.status(400).json({ message: "Cantidad inválida" });
      }
    }

    await cart.save();

    res.status(200).json({
      message: "Carrito actualizado correctamente",
      cart,
    });
  } catch (error) {
    console.error("Error al actualizar carrito:", error);
    res.status(500).json({
      message: `Error al actualizar carrito: ${error.message}`,
    });
  }
});


//DELETE producto especifico
cartRoutes.delete("/:usuarioId/:productoId", authenticateToken, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { productoId } = req.body;
  
    if (String(req.user.id) !== String(usuarioId) && req.user.rol !== "admin") {
      return res.status(403).json({ message: "No autorizado para eliminar este carrito" });
    }

    const cart = await Cart.findOne({ usuarioId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    if (productoId) {
      cart.items = cart.items.filter(
        (item) => String(item.productoId) !== String(productoId)
      );
      await cart.save();
      return res.status(200).json({
        message: "Producto eliminado del carrito",
        cart,
      });
    }
  } catch (error) {
    console.error("Error al eliminar carrito:", error);
    res.status(500).json({
      message: `Error al eliminar carrito: ${error.message}`,
    });
  }
});

//DELETE eliminar todo el carrito

cartRoutes.delete("/:usuarioId", authenticateToken, async(req, res)=>{
  try {
    const {usuarioId} = req.params;

  if (String(req.user.id) !== String(usuarioId) && req.user.rol !== "admin") {
      return res.status(403).json({ message: "No autorizado para eliminar este carrito" });
    }

    const cart = await Cart.findOne({ usuarioId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }


   await Cart.findOneAndDelete({ usuarioId });

    res.status(200).json({ message: "Carrito eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar carrito:", error);
    res.status(500).json({
      message: `Error al eliminar carrito: ${error.message}`})
  }
})
