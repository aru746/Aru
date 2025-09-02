const axios = require("axios");
const ytdl = require("ytdl-core"); // npm install ytdl-core

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "sing",
    version: "3.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "music",
    guide: "{p}sing [song name]"
  },

  onStart: async function ({ api, event, args, message }) {
    if (args.length === 0) {
      return message.reply("❌ | Please provide a song name\n\nExample: sing mood lofi");
    }

    const songName = args.join(" ");
    try {
      // 🎶 Try YouTube first
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(songName)}&key=YOUR_YT_API_KEY`;

      const res = await axios.get(searchUrl);
      if (res.data.items && res.data.items.length > 0) {
        const videoId = res.data.items[0].id.videoId;
        const videoTitle = res.data.items[0].snippet.title;

        const audioStream = ytdl(videoId, { filter: "audioonly", quality: "highestaudio" });

        return message.reply({
          body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐬𝐨𝐧𝐠 🎶: ${videoTitle}`,
          attachment: audioStream
        });
      } else {
        // If YouTube gives nothing, use API fallback
        return this.fallbackAPI(songName, message);
      }
    } catch (err) {
      console.error("YouTube search error:", err.message);
      // If YouTube fails (quota or error) → API fallback
      return this.fallbackAPI(songName, message);
    }
  },

  // 🔹 Fallback: use Mahmud API if YouTube fails
  fallbackAPI: async function (songName, message) {
    try {
      const query = encodeURIComponent(songName);
      const apiUrl = `${await mahmud()}/api/sing2?songName=${query}&strict=true`;

      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: { "author": module.exports.config.author }
      });

      return message.reply({
        body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐬𝐨𝐧𝐠 🎶: ${songName}`,
        attachment: response.data
      });
    } catch (error) {
      console.error("API fallback error:", error.message);
      return message.reply("❌ | Sorry, I couldn’t fetch that song 😢");
    }
  }
};
