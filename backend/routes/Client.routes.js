const express = require("express");

const Client = require("../models/Client");
const FilingRecord = require("../models/FilingRecord");
const { protect } = require("../middlewares/auth.middleware");
const { syncClientFilings } = require("../services/filingSync.service");
const { getGSTINData } = require("../services/gstin.service");
const { getUpcomingDeadlines } = require("../services/deadline.service");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

router.post("/", protect, asyncHandler(async (req, res) => {
  console.log("[CLIENT] Incoming create request body:", req.body);

  const { gstin } = req.body;

  if (!gstinRegex.test(gstin || "")) {
    return res.status(400).json({
      message: "Invalid GSTIN format",
    });
  }

  let gstData;

  try {
    gstData = await getGSTINData(gstin);
  } catch (err) {
    console.error("[CLIENT] GST fetch failed:", err.message);
    return res.status(500).json({
      message: "GST fetch failed. Try again later.",
    });
  }

  console.log("[CLIENT] GST API result:", gstData);

  const client = await Client.create({
    caId: req.user._id,
    gstin: gstin.trim().toUpperCase(),
    businessName: gstData.businessName,
    gstType: gstData.gstType,
    state: gstData.state,
    registrationDate: gstData.registrationDate,
    dataSource: gstData.dataSource,
  });

  await syncClientFilings(client);

  res.json(client);
}));

router.get("/", protect, asyncHandler(async (req, res) => {
  const clients = await Client.find({ caId: req.user._id });
  res.json(clients);
}));

router.get("/:id", protect, asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    caId: req.user._id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  res.json(client);
}));

router.put("/:id", protect, asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, caId: req.user._id },
    req.body,
    { new: true }
  );

  res.json(client);
}));

router.delete("/:id", protect, asyncHandler(async (req, res) => {
  await Client.findOneAndDelete({
    _id: req.params.id,
    caId: req.user._id,
  });

  res.json({ message: "Client deleted" });
}));

router.post("/:id/sync", protect, asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    caId: req.user._id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  await syncClientFilings(client);

  res.json({ message: "Sync completed" });
}));

router.get("/:id/filings", protect, asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    caId: req.user._id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  const filings = await FilingRecord.find({ clientId: client._id });
  res.json(filings);
}));

router.get("/:id/deadlines", protect, asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    caId: req.user._id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  const deadlines = getUpcomingDeadlines(client);
  res.json(deadlines);
}));

module.exports = router;
