const axios = require("axios");

module.exports = {
  config: {
    name: "device",
    aliases: ["android"],
    version: "1.1",
    author: "@Tas33n | Fixed with JuheAPI",
    countDown: 5,
    role: 0,
    shortDescription: "Get device specs via JuheAPI",
    category: "fun",
    guide: "{pn} <device name>"
  },

  onStart: async function ({ message, args }) {
    const name = args.join(" ");
    if (!name) return message.reply("⚠️ Please enter a device name!");

    const API_KEY = process.env.JUHE_API_KEY; // securely provide your JuheAPI key
    if (!API_KEY) return message.reply("⚠️ API key not set!");

    try {
      // Step 1: Search for device to get its ID
      const searchRes = await axios.get("https://api.juheapi.com/phone-spec/v1/search", {
        params: { apikey: API_KEY, keyword: name }
      });

      const searchData = searchRes.data;
      if (searchData.code !== "200" || !searchData.data?.results?.length) {
        return message.reply("🥺 Device not found!");
      }

      const id = searchData.data.results[0].id;

      // Step 2: Get full details
      const detailRes = await axios.get("https://api.juheapi.com/phone-spec/v1/detail", {
        params: { apikey: API_KEY, id: id }
      });

      const detailData = detailRes.data;
      if (detailData.code !== "200" || !detailData.data) {
        return message.reply("🥺 Could not retrieve device details!");
      }

      const dvic = detailData.data;
      const img = dvic.main_image;

      // Organize specs into a neat object for easy formatting:
      const specs = {};
      if (dvic.specs && Array.isArray(dvic.specs)) {
        dvic.specs.forEach((item) => {
          const category = item.category || "Other";
          if (!specs[category]) specs[category] = [];
          specs[category].push(`${item.name}: ${item.value}`);
        });
      }

      // Create message body
      let body = `╭「 Device: ${dvic.device_name} (${dvic.brand_name}) 」\n`;
      for (const [cat, entries] of Object.entries(specs)) {
        body += `\n╭— ${cat}\n`;
        entries.forEach((e) => (body += `│ • ${e}\n`));
        body += "╰———————\n";
      }

      const form = { body };
      if (img) form.attachment = await global.utils.getStreamFromURL(img);
      return message.reply(form);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Unexpected error fetching device data.");
    }
  }
};
