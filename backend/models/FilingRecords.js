const mongoose = require("mongoose");

const filingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  gstin: String,
  returnType: String,
  period: String,
  dueDate: Date,
  filedDate: Date,
  status: String,
  lateByDays: Number,
  penalty: Number,
}, { timestamps: true });

module.exports = mongoose.model("FilingRecord", filingSchema);