import mongoose from "mongoose";


const userModel = mongoose.Schema(
    {
        nombre: {type:String, require:true},
        email: { type : String},
        contrasena:{type:String, require:true},
        rol:{type: String, enum:["cliente","admin"], default: "cliente"},
        perfil:{
            fechaNacimiento:{type: Date},
            avatarURL: {type: String}
        }

    },
)

export const User = mongoose.model("users", userModel)
