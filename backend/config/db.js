const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] MongoDB connected");
  } catch (error) {
    console.error("[DB] Connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
