const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://mahi-apis.onrender.com/api/tiktok?search=${encodeURIComponent(query)}`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["animeedit", "anisar", "ani-s"],
    author: "Mahi--",
    version: "3.5",
    shortDescription: { en: "Search TikTok anime edit videos" },
    longDescription: { en: "Search and fetch TikTok anime edit videos based on your query." },
    category: "media",
    guide: { en: "anisearch [query]  (works without prefix)" },
    usePrefix: false
  },

  // Unified handler (works for both prefix & noprefix)
  onChat: async function ({ api, event }) {
    const body = (event.body || "").trim();
    if (!body) return;

    // Match against triggers
    const triggers = ["anisearch", "animeedit", "tiktoksearch", "ani-s"];
    const lower = body.toLowerCase();
    const found = triggers.find(t => lower.startsWith(t));
    if (!found) return;

    const args = body.split(" ").slice(1);
    api.setMessageReaction("✨", event.messageID, () => {}, true);

    if (!args.length) {
      return api.sendMessage("❌ Please provide a search query.", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const modifiedQuery = `${query} anime edit`;
    const videos = await fetchTikTokVideos(modifiedQuery);

    if (!videos || videos.length === 0) {
      return api.sendMessage(`❌ No videos found for query: ${query}.`, event.threadID, event.messageID);
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.video;
    const title = selectedVideo.title || "No title available";

    if (!videoUrl) {
      return api.sendMessage("⚠️ Error: Video not found in the API response.", event.threadID, event.messageID);
    }

    try {
      const videoStream = await getStreamFromURL(videoUrl);
      await api.sendMessage({
        body: `🎥 Video Title: ${title}\n\nHere’s your anime edit!`,
        attachment: videoStream,
      }, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ An error occurred while processing the video.\nPlease try again later.", event.threadID, event.messageID);
    }
  }
};
