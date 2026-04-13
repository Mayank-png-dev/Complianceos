const cron = require("node-cron");
const Client = require("../models/client");
const AlertLog = require("../models/AlertLog");
const { getUpcomingDeadlines, shouldAlert } = require("./deadline.service");
const { sendWhatsAppAlert } = require("./whatsapp.services");

cron.schedule("*/1 * * * *", async () => {
  console.log("Running alert check...");

  const clients = await Client.find({ isActive: true });

  for (let client of clients) {
    const deadlines = getUpcomingDeadlines(client);

    for (let d of deadlines) {
      if (shouldAlert(d)) {

        // 🔥 Decide alert type
        let alertType =
          d.daysUntilDue === 7 ? "7day" :
          d.daysUntilDue === 3 ? "3day" :
          d.daysUntilDue === 1 ? "1day" :
          "overdue";

        // 🔥 Check if already sent
        const alreadySent = await AlertLog.findOne({
          clientId: client._id,
          returnType: d.returnType,
          period: d.period,
          alertType: alertType,
        });

        if (alreadySent) {
          continue; // skip duplicate
        }

        // 🔥 Send alert (for now console)
        const message = `⚠️ ${client.businessName}: ${d.returnType} due in ${d.daysUntilDue} days`;

        await sendWhatsAppAlert(client.contactPhone, message);

        // 🔥 Save alert log
        await AlertLog.create({
          clientId: client._id,
          returnType: d.returnType,
          period: d.period,
          alertType: alertType,
          sentAt: new Date(),
          channel: "console",
          status: "sent",
        });
      }
    }
  }
});