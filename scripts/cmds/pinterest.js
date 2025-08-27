const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pin",
    version: "1.0.3",
    author: "JVB",
    role: 0,
    countDown: 50,
    shortDescription: {
      en: "Search for images on Pinterest"
    },
    longDescription: {
      en: "Search Pinterest and return multiple images"
    },
    category: "image",
    guide: {
      en: "{prefix}pinterest <search query> -<number of images>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const keySearch = args.join(" ");
      if (!keySearch.includes("-")) {
        return api.sendMessage(
          `❌ Please enter the search query and number of images in the format:\n${this.config.guide.en}`,
          event.threadID,
          event.messageID
        );
      }

      const keySearchs = keySearch.substring(0, keySearch.indexOf("-")).trim();
      const numberSearch = parseInt(keySearch.split("-").pop().trim()) || 6;

      // Step 1: Notify the user
      await api.sendMessage(
        `🔎 Searching Pinterest for "${keySearchs}", please wait...`,
        event.threadID
      );

      // Step 2: Fetch image data from API
      const res = await axios.get(
        `https://celestial-dainsleif-v2.onrender.com/pinterest?pinte=${encodeURIComponent(keySearchs)}`
      );
      const data = res.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        return api.sendMessage(
          `❌ No image data found for "${keySearchs}". Please try another search query.`,
          event.threadID,
          event.messageID
        );
      }

      const imgData = [];
      const cacheFolder = path.join(__dirname, "cache");
      await fs.ensureDir(cacheFolder);

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        const imageUrl = data[i].image;
        try {
          const imgResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
          const imgPath = path.join(cacheFolder, `${i + 1}.jpg`);
          await fs.writeFile(imgPath, imgResponse.data);
          imgData.push(fs.createReadStream(imgPath));
        } catch (err) {
          console.error(`Failed to download image ${i + 1}:`, err.message);
        }
      }

      // Step 3: Send images
      if (imgData.length > 0) {
        await api.sendMessage(
          {
            attachment: imgData,
            body: `✅ Here are the top ${imgData.length} image results for "${keySearchs}":`
          },
          event.threadID,
          event.messageID
        );
      } else {
        await api.sendMessage(
          `❌ Failed to download any images for "${keySearchs}".`,
          event.threadID,
          event.messageID
        );
      }

      // Step 4: Clean up cache
      await fs.remove(cacheFolder);

    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ An error occurred. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
