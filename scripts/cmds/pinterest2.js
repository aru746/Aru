const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest2",
    aliases: ["pin2", "pint2"],
    version: "1.1",
    author: "nexo_here + fixed by Arijit",
    countDown: 2,
    role: 0,
    description: "Search Pinterest and get image results",
    category: "image",
    guide: {
      en: "{pn} [keyword] — Get Pinterest image results\nExample: {pn} Naruto"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "❗ Please provide a search keyword.\nExample: pinterest Naruto",
        event.threadID,
        event.messageID
      );
    }

    try {
      const count = 5;
      const url = `https://betadash-api-swordslush-production.up.railway.app/pinterest?search=${encodeURIComponent(query)}&count=${count}`;
      const res = await axios.get(url);

      const imageList = res.data?.data;
      if (!Array.isArray(imageList) || imageList.length === 0) {
        return api.sendMessage("❌ No results found!", event.threadID, event.messageID);
      }

      const attachments = [];

      for (let i = 0; i < imageList.length; i++) {
        try {
          const imageRes = await axios.get(imageList[i], { responseType: "arraybuffer" });
          const imagePath = path.join(__dirname, `cache_pin_${event.senderID}_${i}.jpg`);
          fs.writeFileSync(imagePath, imageRes.data);
          attachments.push(fs.createReadStream(imagePath));
        } catch (imgErr) {
          console.error(`⚠️ Failed to fetch image ${i + 1}:`, imgErr.message);
        }
      }

      if (attachments.length === 0) {
        return api.sendMessage("❌ Failed to download images.", event.threadID, event.messageID);
      }

      api.sendMessage(
        {
          body: `🔍 Pinterest results for: "${query}"`,
          attachment: attachments
        },
        event.threadID,
        () => {
          // Cleanup cached files safely
          attachments.forEach((_, i) => {
            const imgPath = path.join(__dirname, `cache_pin_${event.senderID}_${i}.jpg`);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          });
        },
        event.messageID
      );

    } catch (err) {
      console.error("❌ Pinterest API error:", err.message);
      api.sendMessage("🚫 Error fetching from Pinterest API. Please try again later.", event.threadID, event.messageID);
    }
  }
};
