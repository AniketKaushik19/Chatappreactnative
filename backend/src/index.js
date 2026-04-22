import express from "express"
import "dotenv/config"
import {toNodeHandler} from "better-auth/node"
import {auth} from "./lib/auth.js"
import { friendRouter } from "./modules/friends/friend.routes.js"
import { chatRouter } from "./modules/chat/chat.routes.js"
const app=express()

app.all("/api/auth/{*any}",toNodeHandler(auth))
app.use(express.json())
app.get("/",(req,res)=>{
    res.send("Hello world from backend server")
})

app.use("/api/v1/friend", friendRouter)
app.use("/api/v1/chat", chatRouter)
app.listen(3000,()=>{
    console.log("Server running");
    
})