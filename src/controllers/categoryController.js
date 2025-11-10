import {Category} from "../models/category.js"

export const createCategory = async(nombre, descripcion)=>{
    const category = new Category(
        {
            nombre,
            descripcion
        }
    )

    const newCategory = await category.save();

    return {category: newCategory}
}