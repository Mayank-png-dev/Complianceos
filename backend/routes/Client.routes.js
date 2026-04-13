const { syncClientFilings } = require("../services/filingSync.service");
const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const { protect } = require("../middlewares/auth.middleware");

// 🔹 CREATE CLIENT
router.post("/", protect, async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      caId: req.user._id,
    });

    // 🔥 THIS IS STEP 7
    await syncClientFilings(client);

    res.json(client);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 GET ALL CLIENTS (only of logged-in CA)
router.get("/", protect, async (req, res) => {
  const clients = await Client.find({ caId: req.user._id });
  res.json(clients);
});

// 🔹 GET SINGLE CLIENT (ownership check 🔥)
router.get("/:id", protect, async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    caId: req.user._id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  res.json(client);
});

// 🔹 UPDATE
router.put("/:id", protect, async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, caId: req.user._id },
    req.body,
    { new: true }
  );

  res.json(client);
});

// 🔹 DELETE
router.delete("/:id", protect, async (req, res) => {
  await Client.findOneAndDelete({
    _id: req.params.id,
    caId: req.user._id,
  });

  res.json({ message: "Client deleted" });
});

router.post("/:id/sync", protect, async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      caId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    await syncClientFilings(client);

    res.json({ message: "Sync completed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const FilingRecord = require("../models/FilingRecord");

router.get("/:id/filings", protect, async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    caId: req.user._id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  const filings = await FilingRecord.find({ clientId: client._id });

  res.json(filings);
});

const { getUpcomingDeadlines } = require("../services/deadline.service");

router.get("/:id/deadlines", protect, async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    caId: req.user._id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  const deadlines = getUpcomingDeadlines(client);

  res.json(deadlines);
});

module.exports = router;
