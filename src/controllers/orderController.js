import { Order } from "../models/orders.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";

export const createOrder = async (usuario, metodoPago, items) => {

  const user = await User.findById(usuario);
  if (!user) throw new Error("Usuario no encontrado");

  if (!items || items.length === 0) throw new Error("Debe incluir al menos un producto");

  let total = 0;
  const itemsConSubtotal = [];

 
  for (const item of items) {
    const producto = await Product.findById(item.producto);
    if (!producto) throw new Error(`Producto con id ${item.producto} no encontrado`);

    const subtotal = producto.precio * item.cantidad;
    total += subtotal;

    itemsConSubtotal.push({
      producto: item.producto,
      cantidad: item.cantidad,
      subtotal,
    });
  }

  const order = new Order({
    usuario,
    metodoPago,
    items: itemsConSubtotal,
    total,
  });

  const newOrder = await order.save();
  return { order: newOrder };
};