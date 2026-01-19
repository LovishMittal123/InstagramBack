import express from "express";
import connectDB from "./connection/connectDB.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import requestRouter from "./routes/request.js";
import profileRouter from "./routes/profile.js";
import userRouter from "./routes/user.js";
import postRouter from "./routes/posts.js";
import MessageRouter from "./routes/message.js";
import cors from "cors";
import http from "http";
import initializeSocket from "./utils/socket.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();


app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://instagram-front-zexe.vercel.app" 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);


app.use("/", MessageRouter);
app.use("/", authRouter);
app.use("/", requestRouter);
app.use("/", profileRouter);
app.use("/", userRouter);
app.use("/", postRouter);


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀"
  });
});


const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Cannot connect to database:", err);
  });
