const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'capcutdl',
    aliases:["capdl"],
    version: '1.1',
    author: 'Nirob',
    role: 0,
    countDown: 5,
    category: 'media',
    shortDescription: 'Download CapCut video automatically',
    longDescription: 'Auto download CapCut videos and send them in chat',
    guide: '{pn} <CapCut video URL>',
  },

  onChat: async ({ api, event, args }) => {
    if (!args[0]) 
      return api.sendMessage('❌ | Please provide a CapCut video URL.', event.threadID, event.messageID);

    const videoUrl = args[0];
    let loadingMessage;

    try {
      // Step 1: Show loading emoji
      loadingMessage = await api.sendMessage('⌛ | Downloading video...', event.threadID);

      // Step 2: Call API
      const response = await axios.get('https://capcut-dl-api.vercel.app/dl', {
        params: { url: videoUrl },
      });

      const data = response.data || {};
      if (!data.url) {
        if (loadingMessage?.messageID) 
          await api.unsendMessage(loadingMessage.messageID);
        return api.sendMessage('❌ | Could not fetch video. Make sure the URL is correct.', event.threadID, event.messageID);
      }

      // Step 3: Download video to temp file
      const tempFilePath = path.join(__dirname, `capcut_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempFilePath);

      const videoResponse = await axios({
        url: data.url,
        method: 'GET',
        responseType: 'stream',
      });

      videoResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Step 4: Delete loading message
      if (loadingMessage?.messageID) 
        await api.unsendMessage(loadingMessage.messageID);

      // Step 5: Send video
      await api.sendMessage(
        {
          body: `✅ | Download Complete!\n\n🎬 Title: ${data.title || 'Unknown'}\n👤 Author: ${data.author || 'N/A'}`,
          attachment: fs.createReadStream(tempFilePath),
        },
        event.threadID,
        () => {
          try { fs.unlinkSync(tempFilePath); } catch {}
        }
      );

    } catch (error) {
      console.error('❌ Error fetching CapCut video:', error.message);
      if (loadingMessage?.messageID) {
        try { await api.unsendMessage(loadingMessage.messageID); } catch {}
      }
      api.sendMessage('❌ | Failed to download video. Try again later.', event.threadID, event.messageID);
    }
  },
};
