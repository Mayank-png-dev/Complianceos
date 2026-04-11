const express = require("express");
const router = express.Router();

const { getGSTINDetails } = require("../services/gstin.service");

router.get("/:gstin", async (req, res) => {
  try {
    const { gstin } = req.params;

    const data = await getGSTINDetails(gstin);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;