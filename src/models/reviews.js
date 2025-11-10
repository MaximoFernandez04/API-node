import mongoose from "mongoose";

const reviewModel = mongoose.Schema(
    {
        usuario: {type: mongoose.Schema.Types.ObjectId, ref:"users", require: true},
        producto: {type: mongoose.Schema.Types.ObjectId, ref:"products", require: true},
        comentario: {type: String},
        rating: {type: Number, min: 1, max: 10, default: 1} 
    }
)

export const Review = mongoose.model("review", reviewModel);