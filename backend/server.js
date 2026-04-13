require("dotenv").config();
require("./services/alertScheduler");
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const gstinRoutes = require("./routes/gstin.routes");

// Use routes
app.use("/api/gstin", gstinRoutes);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();
  
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const clientRoutes = require("./routes/Client.routes");

app.use("/api/clients", clientRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

console.log("Client routes loaded");
startServer();
