const axios = require("axios");
const fs = require("fs");
const path = require("path");

let isEnabled = false; // Default OFF

module.exports = {
  config: {
    name: "autodl",
    aliases: [],
    version: "1.7.1",
    author: "Nazrul",
    role: 0,
    description: "Auto-download media from any platform with toggle",
    category: "media",
    guide: {
      en: "#autodl2 on → Turn ON auto-download\n#autodl2 off → Turn OFF auto-download"
    }
  },

  // Toggle ON/OFF
  onStart: async function ({ api, event, args }) {
    const commandArg = args?.[0]?.toLowerCase();

    if (commandArg === "on") {
      isEnabled = true;
      return api.sendMessage("✅ Auto-download সিস্টেম এখন চালু করা হলো!", event.threadID);
    }

    if (commandArg === "off") {
      isEnabled = false;
      return api.sendMessage("❌ Auto-download সিস্টেম এখন বন্ধ করা হলো!", event.threadID);
    }

    return api.sendMessage(
      `ℹ ব্যবহার:\n#autodl2 on (চালু করতে)\n#autodl2 off (বন্ধ করতে)\n\nবর্তমান স্ট্যাটাস: ${isEnabled ? "✅ চালু" : "❌ বন্ধ"}`,
      event.threadID
    );
  },

  // Auto download when link is detected
  onChat: async function ({ api, event }) {
    if (!isEnabled) return;

    const url = event.body?.match(/https?:\/\/[^\s]+/)?.[0];
    if (!url) return;

    try {
      api.setMessageReaction("😁", event.messageID, () => {}, true);

      const apiUrl = (await axios.get("https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json")).data.api;
      const fullApi = `${apiUrl}/nazrul/alldlxx?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(fullApi);

      if (!data.url) throw new Error(data.error || "ডাউনলোড লিংক পাওয়া যায়নি!");

      const ext = path.extname(new URL(data.url).pathname) || ".mp4";
      const filePath = path.join(__dirname, `n_${Date.now()}${ext}`);
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url: data.url,
        method: "GET",
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: `${data.t}\n🛠 Platform: ${data.p}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID
      );

      fs.unlink(filePath, () => {});
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(`❌ ডাউনলোড ব্যর্থ! কারণ: ${e.message}`, event.threadID);
    }
  }
};
