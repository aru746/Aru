const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    version: "1.1",
    author: "Raihan Fiba",
    countDown: 5,
    role: 0,
    shortDescription: "Upscale image to 4K",
    longDescription: "Upscale replied image to 4K quality using Kaiz API",
    category: "𝐈𝐌𝐀𝐆𝐄",
    guide: {
      en: "{p}4k (reply to an image)"
    }
  },

  onStart: async function({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
      return api.sendMessage("❌ | Please reply to an image to upscale it to 4K.", threadID, messageID);
    }

    // Send "Processing..." message first
    const waitMsg = await api.sendMessage("⏳ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭, 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠", threadID, messageID);

    const imgUrl = encodeURIComponent(messageReply.attachments[0].url);
    const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale?imageUrl=${imgUrl}&apikey=f2ce3b96-a3a7-4693-a19e-3daf4aa64675`;

    const tmpPath = path.join(__dirname, "cache", `${Date.now()}_4k.jpg`);

    try {
      const response = await axios.get(apiUrl, { responseType: "stream" });

      response.data.pipe(fs.createWriteStream(tmpPath)).on("finish", async () => {
        // Delete the wait message
        await api.unsendMessage(waitMsg.messageID);

        // Send the upscaled image
        api.sendMessage({
          body: "✅ | Here is your 4K upscaled image.",
          attachment: fs.createReadStream(tmpPath)
        }, threadID, () => fs.unlinkSync(tmpPath));
      });
    } catch (e) {
      console.error(e);
      await api.unsendMessage(waitMsg.messageID);
      api.sendMessage("❌ | Failed to upscale the image. Please try again later.", threadID, messageID);
    }
  }
};
