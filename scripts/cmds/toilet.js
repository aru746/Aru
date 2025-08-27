const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "toilet",
    aliases: ["toilet"],
    version: "3.1",
    author: "♡ 𝐻𝐴𝑆𝐴𝑁 ♡ + Fixed by Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Face on toilet meme",
    longDescription: "Overlay a user's avatar onto a toilet meme image",
    category: "fun",
    guide: "{pn} [mention someone or reply to a message]",
  },

  onStart: async function ({ message, event }) {
    try {
      const mentions = event.mentions || {};
      const targetID = Object.keys(mentions)[0] || (event.messageReply && event.messageReply.senderID) || event.senderID;
      const senderID = event.senderID;

      // 🚫 Owner protection
      if (targetID === "100069254151118" && senderID !== "100069254151118") {
        return message.reply("🚫 You deserve this, not my owner! 😙");
      }

      // Temp dir
      const tempDir = path.join(__dirname, "temp_toilet");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const avatarPath = path.join(tempDir, `avatar_${targetID}.png`);
      const outputPath = path.join(tempDir, `toilet_${targetID}.png`);

      // Download avatar
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarResp = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(avatarPath, avatarResp.data);

      // Load avatar & background
      const avatar = await jimp.read(avatarPath);
      const bg = await jimp.read("https://i.ibb.co/qFzXq9m/toilet-meme.png"); // ✅ working toilet meme

      // Resize & crop
      avatar.resize(400, 400).circle();
      bg.resize(1080, 1350);

      // Composite
      bg.composite(avatar, 310, 670);

      // Save final
      await bg.writeAsync(outputPath);

      // Get user name
      const userInfo = await message.getUserInfo(targetID);
      const name = userInfo?.name || "Someone";

      // Send result
      await message.reply(
        {
          body: `🤣 ${name} is now enjoying the toilet meme! 🚽`,
          mentions: [{ tag: name, id: targetID }],
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          // cleanup
          fs.unlinkSync(avatarPath);
          fs.unlinkSync(outputPath);
        }
      );

    } catch (err) {
      console.error("❌ Toilet command error:", err);
      return message.reply("❌ Failed to generate toilet meme. Check logs for details.");
    }
  }
};
