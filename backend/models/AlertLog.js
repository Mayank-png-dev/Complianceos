const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  clientId: mongoose.Schema.Types.ObjectId,
  returnType: String,
  period: String,
  alertType: String,
  sentAt: Date,
  channel: String,
  status: String,
});

module.exports = mongoose.models.AlertLog || mongoose.model("AlertLog", alertSchema);