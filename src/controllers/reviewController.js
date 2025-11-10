import {Product} from "../models/product.js"
import {User} from "../models/user.js"
import { Review } from "../models/reviews.js";

export const createReview = async(usuarioId, productoId, comentario, rating)=>{
    const usuario = await User.findById(usuarioId);
    const producto = await Product.findById(productoId);
    console.log(usuarioId)
    if(!usuario) throw new Error("Usuario no encontrado");
    if(!producto) throw new Error("Producto no encontrado");

    const review = new Review(
        {
            usuario: usuarioId,
            producto: productoId,
            comentario,
            rating
        }
    )
    const newReview = await review.save()
    return {review: newReview}
}