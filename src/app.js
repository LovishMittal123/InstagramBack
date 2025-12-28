import express from 'express';
import connectDB from './connection/connectDB.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import requestRouter from './routes/request.js';
import profileRouter from './routes/profile.js';
import userRouter from './routes/user.js';
import postRouter from './routes/posts.js';
import MessageRouter from './routes/message.js';
import cors from 'cors';
import http from 'http';
import initializeSocket from './utils/socket.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://instagram-front-geuu.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

// ✅ Routes
app.use('/', MessageRouter);
app.use('/', authRouter);
app.use('/', requestRouter);
app.use('/', profileRouter);
app.use('/', userRouter);
app.use('/', postRouter);

// ✅ Root redirect
app.get("/", (req, res) => {
  res.redirect("https://instagram-front-geuu.vercel.app/");
});

// ✅ Create HTTP server for Socket.IO
const server = http.createServer(app);
initializeSocket(server);

// ✅ Start server ONLY ONCE
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Database connected successfully');
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Cannot connect to database:', err);
  });
