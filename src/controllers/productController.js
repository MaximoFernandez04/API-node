import { Category } from "../models/category.js"
import {Product} from "../models/product.js"

export const createProduct = async(nombre, descripcion, precio, stock, categoriaId)=>{

    const category = await Category.findById(categoriaId)
    
    if(!category) throw new Error("Categoria no encontrada")

    const product = new Product(
        {
            nombre,
            descripcion,
            precio,
            stock,
            categoria: categoriaId
        }
    )
    const newProduct = await product.save();

    return {product: newProduct}
}