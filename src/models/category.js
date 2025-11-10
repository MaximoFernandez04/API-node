import mongoose from "mongoose";

const categoryModel = mongoose.Schema(
    {
        nombre:{type: String, required: true},
        descripcion: {type: String}
    }
)

export const Category = mongoose.model("categories", categoryModel);