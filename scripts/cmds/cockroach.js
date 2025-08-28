const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "cockroach",
  version: "2.0.1",
  author: "Arafat",
  cooldowns: 5,
  role: 0, // 0 = all users
  shortDescription: "Turns someone into a cockroach!",
  longDescription: "Turns mentioned/replied user into a cockroach 🪳",
  category: "fun",
  guide: {
    en: "{pn} @mention or reply"
  }
};

module.exports.onStart = async function ({ api, event, message, usersData }) {
  try {
    let targetID = Object.keys(event.mentions || {})[0];
    if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
    }
    if (!targetID) {
      return message.reply("🪳 Please tag or reply to someone to turn them into a cockroach!");
    }

    // === Owner Protection ===
    const ownerID = "100069254151118";
    if (targetID === ownerID) {
      return message.reply("🚫 You deserve this, not my owner! 😙");
    }

    const base = path.join(__dirname, "..", "resources");
    const bgPath = path.join(base, "cockroach.png");
    const avatarPath = path.join(base, `avatar_${targetID}.png`);
    const outputPath = path.join(base, `cockroach_${targetID}.png`);

    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

    // Download cockroach template if not exists
    if (!fs.existsSync(bgPath)) {
      const resp = await axios.get(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/main/cockroach.png",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(bgPath, resp.data);
    }

    // Download user avatar
    const avatarResp = await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    fs.writeFileSync(avatarPath, avatarResp.data);

    // === Canvas Process ===
    const bg = await loadImage(bgPath);
    const avatar = await loadImage(avatarPath);

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    // Draw background (cockroach template)
    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    // Circle mask avatar
    const size = 130;
    const x = 460; // cockroach head X
    const y = 350; // cockroach head Y

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

    const userInfo = await usersData.get(targetID);
    const name = userInfo?.name || "Someone";

    await message.reply({
      body: `🤣 ${name} হলো একটা আসল তেলাপোকা! 🪳`,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(outputPath)
    });

    // cleanup
    fs.unlinkSync(avatarPath);
    fs.unlinkSync(outputPath);

  } catch (e) {
    console.error("Cockroach command error:", e);
    return message.reply("❌ | Something went wrong while generating the image.");
  }
};
