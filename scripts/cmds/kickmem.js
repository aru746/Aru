const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "kickmem",
    version: "3.2",
    author: "Arijit",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api, usersData }) => {
    try {
      if (event.logMessageType !== "log:unsubscribe") return;

      const { threadID } = event;
      const threadData = await threadsData.get(threadID);
      if (!threadData?.settings?.sendLeaveMessage) return;

      const { leftParticipantFbId } = event.logMessageData;
      if (!leftParticipantFbId || leftParticipantFbId == api.getCurrentUserID()) return;

      const userName = await usersData.getName(leftParticipantFbId);

      // Detect if kicked (left != author)
      const isKicked = leftParticipantFbId != event.author;
      if (!isKicked) return;

      const text = `👉 ${userName} গ্রুপে থাকার যোগ্যতা নেই দেখে kick খেয়েছে 🤣`;

      const gifUrl = "https://i.postimg.cc/sDFQg1tr/VID-20250826-WA0001.gif";
      const tempFile = path.join(__dirname, `kickmem_${Date.now()}.gif`);

      // Download GIF as buffer and save temporarily
      const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
      await fs.writeFile(tempFile, Buffer.from(response.data, "binary"));

      // Send message with GIF
      await message.send({
        body: text,
        mentions: [{ tag: userName, id: leftParticipantFbId }],
        attachment: fs.createReadStream(tempFile)
      });

      // Delete temp file after sending
      await fs.remove(tempFile);

    } catch (err) {
      console.error("Kickmem event error:", err.message);
      // Fallback: only text
      const { leftParticipantFbId } = event.logMessageData;
      if (leftParticipantFbId) {
        const userName = await usersData.getName(leftParticipantFbId);
        const text = `👉 ${userName} গ্রুপে থাকার যোগ্যতা নেই দেখে kick খেয়েছে 🤣`;
        await message.send({
          body: text,
          mentions: [{ tag: userName, id: leftParticipantFbId }]
        });
      }
    }
  }
};
