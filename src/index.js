import express from 'express';
import 'dotenv/config'
import mongoose from 'mongoose';
import {userRoutes} from './routes/userRoutes.js';
import { categoryRoutes } from './routes/categoryRoutes.js';
import { productRoutes } from './routes/productRoutes.js';
import { cartRoutes } from './routes/cartRoutes.js';
import { reviewRoutes } from './routes/reviewRoutes.js';
import { orderRoutes } from './routes/orderRoutes.js';

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URL,{dbName:process.env.DB_NAME})
    .then(()=> console.log("Conexión Correcta"))
    .catch((e)=>{
        console.log("Error al conectarse con mongo", e)
})

//ROUTES
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/review", reviewRoutes)
app.use("/order",orderRoutes)


app.listen(process.env.PORT,()=>{
    console.log("corriendo en el puerto: ", process.env.PORT)
})

