import express from "express";
import cors from "cors";


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))



app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({limit: "20kb", extended: true}))
app.use(express.static("public"))


// routes 

import userRouter from './routes/auth.routes.js'

// routes declartion
app.use("/api/v1/users",userRouter);
// app.use("/api/v1/auth", userRouter);

import postRoutes from "./routes/post.routes.js";

app.use("/api/v1/posts", postRoutes);



export { app }