const axios = require("axios");
const fs = require("fs");
const request = require("request");

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
    category: "auto",
    dependencies: {
      "request": "",
      "axios": "",
      "fs-extra": ""
    }
  },

  // ✅ Must-have function, even if unused
  onStart: async function () {
    // No need to implement anything
  },

  onChat: async function ({ message, event }) {
    const { body } = event;
    if (!body) return;

    const text = body.toLowerCase();

    if (text.startsWith("😭")) {
      const captions = [
        "╭•┄┅════❁🎀❁════┅┄•╮\n\n 𝗜 𝗸𝗻𝗼𝘄 𝘆𝗼𝘂 𝗦𝗮𝗱 😔\n\n╰•┄┅════❁🎀❁════┅┄•╯",
        "╭•┄┅════❁🎀❁════┅┄•╮\n\n 𝗜 𝗸𝗻𝗼𝘄 𝘆𝗼𝘂 𝘀𝗮𝗱 😔\n\n╰•┄┅════❁🎀❁════┅┄•╯"
      ];
      const messageText = captions[Math.floor(Math.random() * captions.length)];
      const videoUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];
      const videoPath = __dirname + "/cache/blove.mp4";

      request(encodeURI(videoUrl))
        .pipe(fs.createWriteStream(videoPath))
        .on("close", () => {
          message.reply({
            body: messageText,
            attachment: fs.createReadStream(videoPath)
          }, () => fs.unlinkSync(videoPath));
        });
    }
  }
};
