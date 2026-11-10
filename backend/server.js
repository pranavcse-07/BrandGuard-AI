const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


const connectDB = require("./config/db");


const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const brandRoutes = require("./routes/brandRoutes");
const contentRoutes = require("./routes/contentRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
 const reviewRoutes = require("./routes/reviewRoutes");
 const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
// Security HTTP headers
app.use(helmet());

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

// Apply rate limiting to API routes
app.use("/api", apiLimiter);

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));


app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to BrandGuard AI Backend API"
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("BrandGuard AI Backend is ready!");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
