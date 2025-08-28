const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "leave",
    version: "2.3",
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

    const text = `👉 ${userName} গ্রুপে থাকার যোগ্যতা নেই দেখে লিভ নিয়েছে 🤣`;

    // ✅ তোমার PostImage direct GIF লিঙ্ক
    const gifUrl = "https://i.postimg.cc/DZLhjf5r/VID-20250826-WA0002.gif";

    let attachmentPath = null;
    try {
      const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
      attachmentPath = path.join(__dirname, "leave.gif");
      fs.writeFileSync(attachmentPath, response.data);
    } catch (e) {
      console.error("GIF download error:", e.message);
    }

    const form = {
      body: text,
      mentions: [{ tag: userName, id: leftParticipantFbId }],
      attachment: attachmentPath ? fs.createReadStream(attachmentPath) : undefined
    };

    await message.send(form);

    if (attachmentPath) {
      fs.unlinkSync(attachmentPath); // clean up the temporary file
    } else {
      await message.send("⚠ GIF ডাউনলোড করা যায়নি। লিঙ্ক ঠিক আছে কিনা দেখে নাও।");
    }
  }
};
