import {User} from "../models/user.js";
import { generateToken } from "../services/auth.service.js";
import { hashPassword, validatePass } from "../services/password.service.js";

export const crearUsuario = async(nombre, email,contrasena, rol, perfil)=>{
    const pass = await hashPassword(contrasena)
    const user = new User(
        {
            nombre,
            email,
            contrasena: pass,
            rol,
            perfil,
        }
    )
    const newUser = await user.save();
    const token = generateToken(newUser)
    
    return {user: newUser, token}
}
export const login = async( email, contrasena)=>{
        const user = await User.findOne({email})
        const passCorrect = await validatePass(contrasena, user.contrasena)
        console.log(passCorrect)
        if(!passCorrect){
         throw new Error("Contraseña invalida");
        }
        const token = generateToken(user)
        return {user,token}
        
}