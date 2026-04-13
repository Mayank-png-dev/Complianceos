const axios = require("axios");

const sendWhatsAppAlert = async (phone, message) => {
  try {
    console.log(`📲 Sending WhatsApp alert to ${phone}`);

    // MOCK (for now)
    console.log(`Message: ${message}`);

    // REAL (later with WATI API)
    /*
    await axios.post(
      "https://live-server-XXXX.wati.io/api/v1/sendTemplateMessage",
      {
        template_name: "compliance_reminder",
        broadcast_name: `alert_${Date.now()}`,
        parameters: [
          { name: "businessName", value: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WATI_TOKEN}`
        }
      }
    );
    */

  } catch (error) {
    console.error("WhatsApp send failed:", error.message);
  }
};

module.exports = { sendWhatsAppAlert };