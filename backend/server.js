import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import recipeRoutes from "./routes/recipes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//     Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

//     Routes
app.use("/api/recipes", recipeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Recipe API is running 🍽️" });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

//     Database + Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`🚀  Backend running at http://localhost:${PORT}`);
      console.log(`📡  API available at http://localhost:${PORT}/api/recipes`);
    });
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
