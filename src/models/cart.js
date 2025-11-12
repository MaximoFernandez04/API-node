import mongoose from  "mongoose";

const cartModel = mongoose.Schema(
    {

        usuarioId: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
        items:[
            {
                productoId:{type: mongoose.Schema.Types.ObjectId, ref: "products", required: true},
                cantidad: {type: Number, required: true, min: 1}
            }
        ],
        activo: {type: Boolean, default:true}
    }
)

export const Cart = mongoose.model("cart", cartModel)

