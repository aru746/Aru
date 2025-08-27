const apiUrl = "https://rexy-apis-p4x9.onrender.com";
const axios = require("axios");

module.exports = {
  config: {
    name: "edit",
    aliases: ["e"],
    version: "1.6.9",
    author: "Rexy",
    role: 0,
    description: "Edit image by URL or reply",
    category: "ai",
    countDown: 9,
    guide: { en: "{pn} [url] [prompt] or reply to image & prompt" }
  },

  onStart: async ({ message, event, args }) => {
    let imgUrl, prompt = "";

    // If user replied to an image
    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
      prompt = args.join(" ");
    }

    // If image URL is given directly
    if (!imgUrl && args[0]) {
      imgUrl = args[0];
      prompt = args.slice(1).join(" ");
    }

    // If no image found
    if (!imgUrl) {
      return message.reply("• Reply to an image or provide image URL!\n• Add Prompt (for edit)");
    }

    // React and send processing message
    message.reaction("⏳", event.messageID);
    const wm = await message.reply("⏳ Editing your image... Please wait!");

    try {
      // Request API
      const res = await axios.get(
        `${apiUrl}/api/edit?imgUrl=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`,
        { responseType: "stream" }
      );

      // Success
      message.reaction("✅", event.messageID);
      await message.unsend(wm.messageID);
      message.reply({ 
        body: "✅ Here's your edited image!", 
        attachment: res.data 
      });

    } catch (error) {
      // Failure
      message.reaction("❌", event.messageID);
      await message.unsend(wm.messageID);
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
