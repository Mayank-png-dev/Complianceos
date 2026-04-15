const express = require("express");

const { getGSTINData } = require("../services/gstin.service");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/:gstin", asyncHandler(async (req, res) => {
  const { gstin } = req.params;
  const data = await getGSTINData(gstin);

  res.status(200).json({
    success: true,
    data,
  });
}));

module.exports = router;
