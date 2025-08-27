const axios = require("axios");
const fs = require("fs");
const path = require("path");

const videoLinks = [
  "https://i.imgur.com/kfJCVZe.mp4",
  "https://i.imgur.com/CZxrvhO.mp4",
  "https://i.imgur.com/eKGg4E7.mp4",
  "https://i.imgur.com/bQ4oGE2.mp4",
  "https://i.imgur.com/MXJ8iJy.mp4",
  "https://i.imgur.com/ULEji9M.mp4"
];

module.exports = {
  config: {
    name: "blove",
    version: "1.0.0",
    credits: "Arafat",
    description: "Auto-reply when someone sends 😭 emoji",
    usage: "",
    cooldown: 5,
    permissions: [0],
    category: "auto-reply",
    dependencies: {
      "axios": "",
      "fs-extra": ""
    }
  },

  onStart: async function () {
    // Ensure cache folder exists
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  },

  onChat: async function ({ message, event }) {
    const { body } = event;
    if (!body) return;

    if (body.trim().startsWith("😭")) {
      const captions = [
        "╭•┄┅════❁🎀❁════┅┄•╮\n\n 𝗜 𝗸𝗻𝗼𝘄 𝘆𝗼𝘂 𝗦𝗮𝗱 😔\n\n╰•┄┅════❁🎀❁════┅┄•╯",
        "╭•┄┅════❁🎀❁════┅┄•╮\n\n 𝗜 𝗸𝗻𝗼𝘄 𝘆𝗼𝘂 𝘀𝗮𝗱 😔\n\n╰•┄┅════❁🎀❁════┅┄•╯"
      ];

      const messageText = captions[Math.floor(Math.random() * captions.length)];
      const videoUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];
      const videoPath = path.join(__dirname, "cache", "blove.mp4");

      try {
        const response = await axios({
          url: videoUrl,
          method: "GET",
          responseType: "stream"
        });

        const writer = fs.createWriteStream(videoPath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
          await message.reply({
            body: messageText,
            attachment: fs.createReadStream(videoPath)
          });
          fs.unlinkSync(videoPath); // Delete file after sending
        });

        writer.on("error", (err) => {
          console.error("Error writing video:", err);
        });

      } catch (error) {
        console.error("Failed to download video:", error);
      }
    }
  }
};
