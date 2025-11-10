import { Product } from "../models/product.js";
import {User} from "../models/user.js";
import {Cart} from "../models/cart.js"

export const addCart = async(usuarioId, productId, cantidad)=>{
    const usuario = await User.findById(usuarioId);
    const producto = await Product.findById(productId);

    
    if(!usuario) throw new Error("Usuario no encontrado");
    if(!producto) throw new Error("Producto no encontrado");

    let cart = await Cart.findOne({usuarioId: usuarioId, activo: true})

    if(!cart){
        cart = new Cart({usuarioId: usuarioId, items: []})
    }

    if (!cart) {
        cart = new Cart({
            usuarioId,
            items: [],
            activo: true,
        });
    }
     const existingItem = cart.items.find(item => item.productoId.equals(productId));

    if (existingItem) {
        existingItem.cantidad += cantidad;
    } else {
        cart.items.push({ productoId: productId, cantidad });
    }

    const newCart = await cart.save();

    return {cart: newCart}
}