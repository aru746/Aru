const axios = require("axios");

module.exports = {
  config: {
    name: "kickmem",
    version: "3.2",
    author: "Arijit",
    category: "events",
  },

  onStart: async ({ threadsData, message, event, api, usersData }) => {
    // Only care about leave/unsubscribe events
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);

    // Only send leave/kick message if enabled in settings
    if (!threadData?.settings?.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (!leftParticipantFbId || leftParticipantFbId === api.getCurrentUserID()) return;

    const userName = await usersData.getName(leftParticipantFbId);

    // Detect if kicked:
    // If the author exists and is not the same as leftParticipant, it's likely a kick
    const isKicked = event.author && event.author !== leftParticipantFbId;

    if (!isKicked) return; // User left voluntarily

    const text = `👉 ${userName} গ্রুপে থাকার যোগ্যতা নেই দেখে kick খেয়েছে 🤣`;

    // GIF to send
    const gifUrl = "https://i.postimg.cc/sDFQg1tr/VID-20250826-WA0001.gif";

    try {
      const response = await axios.get(gifUrl, { responseType: "stream" });

      await message.send({
        body: text,
        mentions: [{ tag: userName, id: leftParticipantFbId }],
        attachment: response.data,
      });
    } catch (err) {
      console.error("Kickmem GIF fetch failed:", err.message);

      // Fallback: just text
      await message.send({
        body: text,
        mentions: [{ tag: userName, id: leftParticipantFbId }],
      });
    }
  },
};
