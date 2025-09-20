const axios = require("axios");

module.exports = {
  config: {
    name: "alya",
    aliases: ["alyachan", "alya-chan"],
    version: "1.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Send a random Alya Chan video",
    longDescription: "Sends one random Alya Chan video with a cute caption",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const videos = [
        "https://files.catbox.moe/oa761p.mp4",
        "https://files.catbox.moe/b0n4vy.mp4",
        "https://files.catbox.moe/e3qtny.mp4",
        "https://files.catbox.moe/ymu0i8.mp4",
        "https://files.catbox.moe/uporic.mp4",
        "https://files.catbox.moe/xa9pve.mp4",
        "https://files.catbox.moe/zh2y51.mp4",
        "https://files.catbox.moe/rba8lv.mp4",
        "https://files.catbox.moe/sh7mhs.mp4"
      ];

      const link = videos[Math.floor(Math.random() * videos.length)];

      message.reply({
        body: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐀𝐥𝐲𝐚 𝐂𝐡𝐚𝐧 𝐯𝐢𝐝𝐞𝐨",
        attachment: await global.utils.getStreamFromURL(link)
      });
    } catch (err) {
      message.reply("❌ | Failed to send video. Please try again.");
      console.error(err);
    }
  }
};
