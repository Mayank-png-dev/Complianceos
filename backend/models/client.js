const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  caId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessName: String,
  gstin: {
    type: String,
    unique: true,
  },
  contactName: String,
  contactPhone: String,
  contactEmail: String,
  gstType: String,
  registrationDate: Date,
  state: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  complianceScore: {
    type: Number,
    default: 100,
  },
  lastSynced: Date,
}, { timestamps: true });

module.exports = mongoose.models.Client || mongoose.model("Client", clientSchema);