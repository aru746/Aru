const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit2",
    version: "1.2.0",
    author: "IMRAN + modified by Arijit",
    cooldowns: 5,
    role: 2, // 2 = Bot Admin only
    category: "image",
    description: "AI image editing using prompt + image (Bot Admin only)",
    usages: "edit2 [prompt] + reply image or link",
    dependencies: { axios: "" },
    aliases: ["e2"]
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      // === Image + Prompt handling ===
      let linkanh = event.messageReply?.attachments?.[0]?.url || null;
      const prompt = args.join(" ").split("|")[0]?.trim();

      if (!linkanh && args.length > 1) {
        linkanh = args.join(" ").split("|")[1]?.trim();
      }

      if (!linkanh || !prompt) {
        return api.sendMessage(
          `📸 𝙀𝘿𝙄𝙏•𝙄𝙈𝙂\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⛔ 𝙔𝙤𝙪 𝙢𝙪𝙨𝙩 𝙜𝙞𝙫𝙚 𝙗𝙤𝙩𝙝 𝙖 𝙥𝙧𝙤𝙢𝙥𝙩 𝙖𝙣𝙙 𝙖𝙣 𝙞𝙢𝙖𝙜𝙚!\n\n` +
          `✨ Example:\n▶ edit2 add cute girlfriend |\n\n` +
          `🖼 Or Reply to an image:\n▶ edit2 add cute girlfriend`,
          event.threadID,
          event.messageID
        );
      }

      linkanh = linkanh.replace(/\s/g, "");
      if (!/^https?:\/\//.test(linkanh)) {
        return api.sendMessage(
          "⚠ Invalid image URL!\n🔗 Must start with http:// or https://",
          event.threadID,
          event.messageID
        );
      }

      const apiUrl = `https://masterapi.fun/api/editimg?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(linkanh)}`;

      // Send waiting message
      const waitMsg = await api.sendMessage("⏳ Please Wait...", event.threadID);

      const tempPath = path.join(__dirname, "cache", `edited_${event.senderID}.jpg`);
      const response = await axios({ method: "GET", url: apiUrl, responseType: "stream" });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: `🔍 Prompt: “${prompt}”\n🖼 AI Art is ready! ✨`,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => {
            fs.unlinkSync(tempPath); // cleanup
            api.unsendMessage(waitMsg.messageID);
          },
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error(err);
        api.sendMessage("❌ Failed to save the image file.", event.threadID, event.messageID);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to generate image. Try again later.", event.threadID, event.messageID);
    }
  }
};
