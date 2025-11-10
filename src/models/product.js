import mongoose from "mongoose";

const productModel = mongoose.Schema(
    {
        nombre: {type: String, required: true},
        descripcion: {type: String},
        precio: {type: Number, required: true, min:0.01},
        stock: {type: Number, default: 0},
        categoria: {type: mongoose.Schema.Types.ObjectId, ref:"categories", required: true}
    }
)

export const Product = mongoose.model("products", productModel)