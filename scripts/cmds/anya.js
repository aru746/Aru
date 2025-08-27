const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "anya",
    aliases: [],
    author: "kshitiz + Arijit",
    version: "3.7",
    cooldowns: 3,
    role: 0,
    shortDescription: {
      en: "Chat with Anya without prefix"
    },
    longDescription: {
      en: "Talk with Anya Forger (AI response + Japanese TTS) without using command prefix"
    },
    category: "ai",
    guide: {
      en: "Just type: anya [your message]"
    }
  },

  // ✅ NOPREFIX MODE
  noPrefix: async function ({ api, event, message }) {
    try {
      const { createReadStream, unlinkSync } = fs;
      const { resolve } = path;
      const { threadID, senderID, body } = event;

      if (!body) return;

      // Trigger only if starts with "anya"
      if (!body.toLowerCase().startsWith("anya")) return;

      const input = body.replace(/^anya/i, "").trim();

      // --- Owner Handling ---
      const OWNER_ID = "100069254151118"; // ✅ Your UID
      let senderName = "";

      if (senderID === OWNER_ID) {
        // Always call you Aru Boss / Arijit Boss
        senderName = Math.random() > 0.5 ? "Aru" : "Arijit Boss";
      } else {
        // Normal users → use first name
        const userInfo = await api.getUserInfo(senderID).catch(() => null);
        senderName = userInfo ? userInfo[senderID]?.firstName || "" : "";
      }

      // Greeting if only "anya"
      if (!input) {
        return message.reply(`Konichiwa ${senderName} senpai ✨`);
      }

      // Translate input → Japanese
      const tranChat = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(input)}`
      );
      const translated = tranChat.data[0][0][0];

      // Final reply text
      const finalText = `${senderName}, ${translated}`;

      // Voicevox TTS
      const audioPath = resolve(__dirname, "cache", `${threadID}_${senderID}.mp3`);
      const voiceRes = await axios.get(
        `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(translated)}&speaker=3`
      );

      if (!voiceRes.data.mp3StreamingUrl) {
        return message.reply(finalText); // fallback text only
      }

      const audioUrl = voiceRes.data.mp3StreamingUrl;
      const audio = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, Buffer.from(audio.data, "binary"));

      const stream = createReadStream(audioPath);
      message.reply({ body: finalText, attachment: stream }, () => unlinkSync(audioPath));
    } catch (error) {
      console.error(error);
      message.reply("⚠️ Anya had a small error, try again later.");
    }
  }
};
