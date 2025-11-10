import bcrypt from "bcrypt"

export const hashPassword = async(contrasena)=>{
    if (!contrasena) throw new Error("No se recibió una contraseña para hashear");
    return await bcrypt.hash(contrasena,10)
}

//comparar contraseñas  
export const validatePass = async (pass,hash)=>{
    return await bcrypt.compare(pass, hash)
}