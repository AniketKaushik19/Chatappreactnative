import express from "express"
import "dotenv/config"
import {toNodeHandler} from "better-auth/node"
import {auth} from "./lib/auth.js"
import { friendRouter } from "./modules/friends/friend.routes.js"
import { chatRouter } from "./modules/chat/chat.routes.js"
import { userRouter } from "./modules/user/user.route.js"
import { setupSocketIo } from "./lib/socket.js"
import {createServer} from 'http'

const app=express()
const httpServer=createServer(app)

export const io=setupSocketIo(httpServer)

app.all("/api/auth/{*any}",toNodeHandler(auth))
app.use(express.json())
app.get("/",(req,res)=>{
    res.send("Hello world from backend server")
})

app.use("/api/v1/friend", friendRouter)
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/user", userRouter)

httpServer.listen(3000,()=>{
    console.log("Server running");
    console.log("Socket.IO server is ready")
})