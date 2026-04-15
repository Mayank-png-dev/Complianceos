if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("./services/alertScheduler");

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/error.middleware");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

const app = express();

app.use(cors());
app.use(express.json());

const gstinRoutes = require("./routes/gstin.routes");
const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/Client.routes");

app.use("/api/gstin", gstinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[SERVER] Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("[SERVER] Startup failed:", error.message);
  process.exit(1);
});
