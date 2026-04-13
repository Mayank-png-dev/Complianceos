const FilingRecord = require("../models/FilingRecord");

const syncClientFilings = async (client) => {
  // MOCK filing data (replace later with real API)
  const mockFilings = [
    { returnType: "GSTR-1", period: "012024", status: "filed" },
    { returnType: "GSTR-3B", period: "012024", status: "late" },
  ];

  for (let filing of mockFilings) {
    await FilingRecord.findOneAndUpdate(
    {
        clientId: client._id,
        returnType: filing.returnType,
        period: filing.period,
    },
    {
        gstin: client.gstin,
        returnType: filing.returnType,
        period: filing.period,
        status: filing.status,
        lateByDays: filing.status === "late" ? 5 : 0,
        penalty: filing.status === "late" ? 500 : 0,
    },
    { upsert: true, new: true }
    );
  }

  // simple compliance score
  let score = 100;
  for (let f of mockFilings) {
    if (f.status === "late") score -= 5;
    if (f.status === "pending") score -= 10;
  }

  if (score < 0) score = 0;

  client.complianceScore = score;
  client.lastSynced = new Date();

  await client.save();
};

module.exports = { syncClientFilings };