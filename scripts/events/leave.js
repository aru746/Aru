const axios = require("axios");

module.exports = {
  config: {
    name: "leave",
    version: "2.2",
    author: "Arijit",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api, usersData }) => {
    // শুধুমাত্র যখন কেউ লিভ নেয় তখন কাজ করবে
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId == api.getCurrentUserID()) return;

    const userName = await usersData.getName(leftParticipantFbId);
    const isSelfLeave = leftParticipantFbId == event.author;
    if (!isSelfLeave) return;

    const text = `👉 ${userName} গ্রুপে থাকার যোগ্যতা নেই দেখে লিভ নিয়েছে 🤣`;

    // ✅ তোমার PostImage direct GIF লিঙ্ক
    const gifUrl = "https://i.postimg.cc/DZLhjf5r/VID-20250826-WA0002.gif";

    let attachment = null;
    try {
      const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
      attachment = Buffer.from(response.data, "binary");
    } catch (e) {
      console.error("GIF download error:", e.message);
    }

    const form = {
      body: text,
      mentions: [{ tag: userName, id: leftParticipantFbId }],
      attachment: attachment || undefined
    };

    await message.send(form);

    if (!attachment) {
      await message.send("⚠ GIF ডাউনলোড করা যায়নি। লিঙ্ক ঠিক আছে কিনা দেখে নাও।");
    }
  }
};
