require("dotenv").config();
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

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
