const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "tango",
  version: "3.2.0",
  author: "Arijit",
  cooldowns: 5,
  role: 0,
  shortDescription: "Mention দে তারে যারে tango বানাবি 🦧",
  longDescription: "Overlay user's avatar onto the body of Tango the orangutan",
  category: "fun",
  guide: {
    en: "{pn} [reply/mention/none] → Turn into Tango",
  },
};

module.exports.onStart = async function ({ api, event, message }) {
  try {
    const mentions = event.mentions || {};
    let targetID = Object.keys(mentions)[0] || (event.messageReply && event.messageReply.senderID) || event.senderID;
    const senderID = event.senderID;

    // 🚫 Owner protection: only block if someone else tries to Tango you
    if (targetID === "100069254151118" && senderID !== "100069254151118") {
      return message.reply("🚫 You deserve this, not my owner! 😙");
    }

    const base = path.join(__dirname, "..", "resources");
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

    const bgPath = path.join(base, "tango_bg.png");
    const avatarPath = path.join(base, `avatar_${targetID}.png`);
    const outputPath = path.join(base, `tango_${targetID}.png`);

    // Download Tango template if missing
    if (!fs.existsSync(bgPath)) {
      const resp = await axios.get("https://files.catbox.moe/ip8kgf.jpg", { responseType: "arraybuffer" });
      fs.writeFileSync(bgPath, resp.data);
    }

    // Download avatar from Graph API
    const avatarResp = await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    fs.writeFileSync(avatarPath, avatarResp.data);

    // Load images
    const bg = await loadImage(bgPath);
    const avatar = await loadImage(avatarPath);

    // Canvas process
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    // Circle crop avatar
    const size = 110;
    const x = 255;
    const y = 32;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    // Save final image
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // Get user info
    const userInfo = await api.getUserInfo(targetID);
    const name = userInfo[targetID]?.name || "Someone";

    // Send result
    await message.reply({
      body: `🤣 ${name} হলো একটি আসল Tango 🦧`,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(outputPath),
    });

    // Cleanup
    fs.unlinkSync(avatarPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error("Tango command error:", err);
    return message.reply("❌ Something went wrong while generating the Tango image.");
  }
};
