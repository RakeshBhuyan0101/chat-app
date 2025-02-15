import express from 'express'
import dotenv from 'dotenv'
import authRoute from './routes/auth.route.js'
import messageRoute from './routes/message.route.js'
import { connectDb } from './lib/db.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
dotenv.config({})
import { app , server } from './lib/socket.js'
import path from 'path'

const __dirname = path.resolve()

app.use(cookieParser())
const corsOption = {
    origin : ["http://localhost:5173"],
    credentials : true
    
}
app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use("/api/user" , authRoute)
app.use("/api/message" , messageRoute)

if (process.env.NODE_ENV === "development") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

server.listen(process.env.PORT , () => {
    connectDb()
    console.log(`app is running on port :  ${process.env.PORT}`)
})