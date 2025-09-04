const axios = require("axios");
const apiUrl = "https://www.noobs-apis.run.place";

module.exports = {
  config: {
    name: "4k",
    aliases: ["4k", "ups"],
    version: "1.7.0",
    author: "Nazrul",
    role: 0,
    description: "Upscale image by URL or by replying to an image",
    category: "image",
    countDown: 9,
    guide: {
      en: "{pn} [url] or reply with image"
    }
  },

  onStart: async ({ message, event, args }) => {
    const startTime = Date.now();
    let imgUrl;

    // Check if reply contains image
    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
    } 
    // Or check if user passed an argument (URL)
    else if (args[0]) {
      imgUrl = args.join(" ");
    }

    // If no image found
    if (!imgUrl) {
      return message.reply("⚠️ Please reply to an image or provide an image URL!");
    }

    // React duck to show processing started
    message.reaction("🦆", event.messageID);

    try {
      // Call upscale API
      const res = await axios.get(
        `${apiUrl}/nazrul/upscale?imgUrl=${encodeURIComponent(imgUrl)}`,
        { responseType: "stream" }
      );

      // Success reaction
      message.reaction("✅", event.messageID);

      const processTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // Send upscale result
      message.reply({
        body: `✨ Premium 4K Upscale Complete!\n📸 Your image is now HD+.\n⏱️ Process Time: ${processTime}s`,
        attachment: res.data
      });

    } catch (error) {
      // Fail reaction
      message.reaction("❌", event.messageID);

      // Send error message
      message.reply(`❌ Upscale Failed!\nError: ${error.message}`);
    }
  }
};
