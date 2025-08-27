const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "murgi",
    version: "1.0.2",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Turn someone into a chicken 🐔",
    longDescription: "Overlays user's avatar on a chicken body image",
    category: "fun",
    guide: {
      en: "{pn} reply to someone's message or mention them to turn into a murgi 🐔",
    },
  },

  onStart: async function ({ event, message, api }) {
    try {
      // Determine target
      let targetID = event.type === "message_reply"
        ? event.messageReply.senderID
        : Object.keys(event.mentions)[0];

      if (!targetID) return message.reply("🐔 Reply or mention someone to make them a murgi!");

      // Owner Protection
      const ownerID = "100069254151118"; // <-- your UID
      if (targetID === ownerID) {
        return message.reply("🚫 You deserve this, not my owner! 😙");
      }

      const baseFolder = path.join(__dirname, "Arijit_murgi");
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      const bgPath = path.join(baseFolder, "murgi_bg.jpg");
      const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
      const outputPath = path.join(baseFolder, `murgi_result_${targetID}.png`);

      // Background chicken image
      const chickenImageURL = "https://files.catbox.moe/ng1j7c.jpg";
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(chickenImageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      // Download avatar
      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(avatarPath, avatarBuffer);

      // Process images
      const bg = await jimp.read(bgPath);
      const avatar = await jimp.read(avatarPath);

      avatar.resize(90, 90).circle();

      // Chicken face position (adjust if needed)
      const x = 160;
      const y = 45;

      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      // Get name
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      // Send result
      await message.reply({
        body: `😂 ${name} has turned into a murgi! 🐔`,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      }, () => {
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("🐔 Murgi command error:", err);
      return message.reply("❌ Failed to create murgi image.");
    }
  }
};
