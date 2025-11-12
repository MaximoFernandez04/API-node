import express from "express";
import 'dotenv/config';
import { crearUsuario, login } from "../controllers/userController.js";
import {User} from "../models/user.js";
import {Cart} from "../models/cart.js";
import { verifyAdmin, verifyToken } from "../services/auth.service.js";


export const userRoutes = express.Router();

export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No existe token" });

    try {
        req.user = verifyToken(token); 
        next();
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
};

//REGISTRO PUBLICO- No se necesita token 
userRoutes.post("/register", async (req, res) => {
  try {
    const { nombre, email, contrasena, perfil } = req.body;
    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ message: "Faltan parámetros requeridos" });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const newUser = await crearUsuario(
      nombre,
      email,
      contrasena,
      "cliente",
      perfil,
    );

    

    res.status(201).json({ message: "Usuario registrado con éxito", user: newUser});
  } catch (error) {
    res.status(500).json({ message: `Error al registrar usuario: ${error.message}` });
  }
});


//Solo acceso admins
//POST /users
userRoutes.post("/",authenticateToken,verifyAdmin, async (req,res) => {
     try {
        const {nombre, email, contrasena, rol, perfil} = req.body
        if(!nombre ||  !email){
                res.status(400).json({mesagge : ' algunos de los parametros estan faltando'})
        }
        const newUser = await crearUsuario(nombre, email,contrasena, rol, perfil)
        res.status(201).json(newUser)
    } catch (error) {
        res.status(500).json({messagge: `Error en el get de users: ${error}`})
    }
})

userRoutes.post("/login", async (req,res) => {
     try {
        const { email, contrasena} = req.body
        if( !email || !contrasena){
                res.status(400).json({mesagge : ' algunos de los parametros estan faltando'})
        }
        const newUser = await login(email,contrasena)
        res.status(201).json(newUser)
    } catch (error) {
        res.status(500).json({message: `Error en el get de users: ${error}`})
    }
})


//GET /users
userRoutes.get("/",authenticateToken,verifyAdmin,async (req,res)=>{
    try {
        const user= await User.find()
        if(user.length === 0 ){
            return res.status(204).json([])
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: `Error en el get de users: ${error}`})
    }
})

//GET /users/:id
userRoutes.get("/:id",authenticateToken,verifyAdmin, async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(user.length === 0 ){
            return res.status(204).json([])
        }
        res.status(200).json(user)
    }catch(error){
        res.status(500).json({message: `Error en el get de users: ${error}`})
    }
})

//DELETE /user/:id
userRoutes.delete("/:id",authenticateToken,verifyAdmin, async(req,res)=>{
    const {id} = req.params
    const userDelete = await User.findByIdAndDelete(id)
    
    if(!userDelete){
        res.status(404).json({message: "no se encontro el usuario"})
    }

    const cart = await Cart.deleteOne({usuarioId: userDelete._id}) 
    res.status(200).json({message: "Eliminado correctamente"})
})

//PATCH
userRoutes.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cambios = req.body;

    if (String(req.user.id) !== String(id) && req.user.rol !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const userActualizado = await User.findByIdAndUpdate(id, cambios, { new: true });
    if (!userActualizado) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ message: "Usuario actualizado", user: userActualizado });
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar usuario: ${error.message}` });
  }
});