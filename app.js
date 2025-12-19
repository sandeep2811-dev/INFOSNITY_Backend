



import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import db from "./config/database.js";
import bodyParser from "body-parser";
import session from "express-session";

// Routes Imports
import userRoute from "./routes/user.route.js";
import placementRoutes from "./routes/placement.route.js";
import aluminsRoute from "./routes/alumins.route.js";
import aiRoutes from './routes/ai.routes.js';
import achievementsRoutes from "./routes/achivements.routes.js";
import clubRoutes from "./routes/clubs.routes.js";
import rdRoutes from "./routes/rd.routes.js";
import blogRoutes from "./routes/blogs.routes.js";
import profileRoutes from "./routes/profiles.routes.js";
import grivenceRoutes from "./routes/grivence.routes.js";
import hecRoutes from "./routes/hec.routes.js";
import { saveRealtimeMessage } from "./controllers/user.controller.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

/* =========================
   DATABASE
========================= */
db.connect();

/* =========================
   MANUAL CORS FIX
========================= */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

/* =========================
   MIDDLEWARES
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* =========================
   SESSION
========================= */
app.use(
    session({
        secret: "testSecret123",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,   // true only in HTTPS
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
    res.send("hello sam");
});

/* =========================
   ROUTES
========================= */
app.use("/api/v1/users", userRoute);
app.use("/api/v1/placements", placementRoutes);
app.use("/api/v1/alumins", aluminsRoute);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/achievements", achievementsRoutes);
app.use("/api/v1/clubs", clubRoutes);
app.use("/api/v1/rd", rdRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/profile", profileRoutes); 
app.use("/api/v1/grivence", grivenceRoutes);
app.use("/api/v1/hec", hecRoutes);

/* =========================
   SOCKET.IO
========================= */
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on("send_message", async (data) => {
        try {
            const saved = await saveRealtimeMessage({
                fromemail: data.sender,
                toemail: data.receiver,
                message: data.message,
                sendtime: data.timestamp
            });

            const payload = {
                ...data,
                timestamp: saved.sendtime || data.timestamp
            };

            // Only emit to other users in the room (not back to sender)
            // Sender already has the message from optimistic update
            socket.to(data.room).emit("receive_message", payload);
            console.log("Message sent to room:", data.room);
        } catch (err) {
            console.error("Error saving realtime message:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

httpServer.listen(5000, () => {
    console.log("🚀 Server running at http://localhost:5000");
});