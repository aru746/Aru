const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "fluxultra",
  aliases: ["fu"], // ✅ Added alias
  version: "2.2",
  role: 0,
  author: "xrotick🥀 | Refined by Raihan Fiba | Fixed by ChatGPT",
  description: "Generate AI artwork using FluxUltra",
  category: "𝐈𝐌𝐀𝐆𝐈𝐍𝐄",
  guide: {
    en: "{pn} <prompt>\n\nExample:\n{pn} a dragon flying in the night sky"
  },
  countDown: 15,
};

module.exports.onStart = async ({ event, args, api }) => {
  const apiUrl = "https://zaikyoov3.koyeb.app/api/fluxultra";
  const userPrompt = args.join(" ");

  if (!userPrompt) {
    return api.sendMessage(
      "⚡ Please provide a prompt.\nExample: fluxultra a dragon in space 🐉✨",
      event.threadID,
      event.messageID
    );
  }

  const prompt = `8k ultra quality, ${userPrompt}`;

  try {
    // Waiting message
    const waitMsg = await api.sendMessage("⚡ Generating your image...", event.threadID);
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    // Ensure cache folder exists
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // API request
    const response = await axios({
      url: `${apiUrl}?prompt=${encodeURIComponent(prompt)}`,
      method: "GET",
      responseType: "stream"
    });

    const imgPath = path.join(cacheDir, `flux_${Date.now()}.png`);
    const writer = fs.createWriteStream(imgPath);

    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: `⚡ 𝐅𝐋𝐔𝐗𝐔𝐋𝐓𝐑𝐀\n\n📝 𝐏𝐫𝐨𝐦𝐩𝐭: ${userPrompt}\n✅ 𝐈𝐦𝐚𝐠𝐞 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝`,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath)
      );

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.unsendMessage(waitMsg.messageID);
    });

    writer.on("error", () => {
      throw new Error("Error saving image stream.");
    });
  } catch (err) {
    console.error("Error in fluxultra command:", err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ Failed to generate image. Please try again later.", event.threadID, event.messageID);
  }
};
