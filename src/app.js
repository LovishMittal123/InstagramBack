// server.js
import express from 'express'
import connectDB from './connection/connectDB.js'
import authRouter from './routes/auth.js'
import cookieParser from 'cookie-parser'
import requestRouter from './routes/request.js'
import profileRouter from './routes/profile.js'
import userRouter from './routes/user.js'
import postRouter from './routes/posts.js'
import MessageRouter from './routes/message.js'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import initializeSocket from './utils/socket.js'

dotenv.config()

const app = express()

// ✅ Middleware
app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
  'http://localhost:5173',                    
  'https://instagram-front-eight.vercel.app'  
]

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman or server-to-server)
    if(!origin) return callback(null, true)
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error(`CORS policy blocked: ${origin}`), false)
    }
    return callback(null, true)
  },
  credentials: true
}))

// ✅ Routes
app.use('/', MessageRouter)
app.use('/', authRouter)
app.use('/', requestRouter)
app.use('/', profileRouter)
app.use('/', userRouter)
app.use('/', postRouter)

// ✅ Create server for socket.io
const server = http.createServer(app)
initializeSocket(server)

// ✅ Connect to DB and start server
connectDB()
  .then(() => {
    console.log('Database connected successfully')

    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('Cannot connect to database:', err)
  })
