import express from 'express'
import connectDB from './connection/connectDB.js'
import authrouter from './routes/auth.js'
import cookieParser from 'cookie-parser'
import requestRouter from './routes/request.js'
import profileRouter from './routes/profile.js'
import userRouter from './routes/user.js'
import postRouter from './routes/posts.js'
import cors from 'cors'
import dotenv from 'dotenv'
const app = express()

// ✅ Global middlewares first
dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true                
}));

// ✅ Then routes
app.use('/', authrouter)
app.use('/', requestRouter)
app.use('/',profileRouter)
app.use('/',userRouter)
app.use('/',postRouter)

connectDB()
  .then(() => {
    console.log("Connection Successfull")
    app.listen(process.env.PORT, () => {
      console.log(`Server listening at port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log("Cant connect to database")
  })
