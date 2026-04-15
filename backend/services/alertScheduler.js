const cron = require("node-cron");

const Client = require("../models/Client");
const AlertLog = require("../models/AlertLog");
const { getUpcomingDeadlines, shouldAlert } = require("./deadline.service");
const { sendWhatsAppAlert } = require("./whatsapp.services");

cron.schedule("*/1 * * * *", async () => {
  console.log("[ALERT] Running alert check...");

  try {
    const clients = await Client.find({ isActive: true });

    for (const client of clients) {
      const deadlines = getUpcomingDeadlines(client);

      for (const deadline of deadlines) {
        if (!shouldAlert(deadline)) {
          continue;
        }

        const alertType =
          deadline.daysUntilDue === 7 ? "7day" :
          deadline.daysUntilDue === 3 ? "3day" :
          deadline.daysUntilDue === 1 ? "1day" :
          "overdue";

        const alreadySent = await AlertLog.findOne({
          clientId: client._id,
          returnType: deadline.returnType,
          period: deadline.period,
          alertType,
        });

        if (alreadySent) {
          continue;
        }

        const message = `${client.businessName}: ${deadline.returnType} due in ${deadline.daysUntilDue} days`;

        await sendWhatsAppAlert(client.contactPhone, message);

        await AlertLog.create({
          clientId: client._id,
          returnType: deadline.returnType,
          period: deadline.period,
          alertType,
          sentAt: new Date(),
          channel: "console",
          status: "sent",
        });
      }
    }
  } catch (error) {
    console.error("[ALERT] Scheduler failure:", error.message);
  }
});
