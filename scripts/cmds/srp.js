const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'short_reactions.json');
let shortReactData = {};

// Load or create JSON
try {
  if (fs.existsSync(jsonPath)) {
    shortReactData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } else {
    fs.writeFileSync(jsonPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error reading or writing JSON file:', error.message);
}

module.exports = {
  config: {
    name: "srp",
    version: "1.0",
    author: "Allou Mohamed + Fix by Mahmud",
    category: "utility",
    role: 2,
    guide: {
      en: "!srp 🙂 => word1,word2"
    }
  },

  // Save new emoji triggers
  onStart: async function ({ message, args, event }) {
    if (args.length < 3 || args[1] !== "=>") {
      return message.reply("❌ | Invalid format. Use: !srp 🙂 => word1,word2");
    }

    const emoji = args[0];
    const groupId = event.threadID;
    const words = args
      .slice(2)
      .join(" ")
      .split(",")
      .map(w => w.trim().toLowerCase())
      .filter(Boolean);

    if (!shortReactData[groupId]) shortReactData[groupId] = {};
    if (!shortReactData[groupId][emoji]) shortReactData[groupId][emoji] = [];

    // Prevent duplicate words
    const existingWords = new Set(shortReactData[groupId][emoji]);
    words.forEach(word => existingWords.add(word));
    shortReactData[groupId][emoji] = Array.from(existingWords);

    // Save updated data
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(shortReactData, null, 2));
      message.reply(`✅ | Added triggers for ${emoji}: ${words.join(", ")}`);
    } catch (err) {
      console.error("Error saving short reactions:", err);
      message.reply("❌ | Failed to save triggers. Check logs.");
    }
  },

  // React to messages
  onChat: async function ({ api, event }) {
    if (!event.body || !event.threadID) return;

    const msgText = event.body.toLowerCase();
    const groupId = event.threadID;

    if (shortReactData[groupId]) {
      for (const emoji in shortReactData[groupId]) {
        const triggers = shortReactData[groupId][emoji].map(w => w.toLowerCase());
        if (triggers.some(word => msgText.includes(word))) {
          api.setMessageReaction(emoji, event.messageID, () => {}, true);
          break;
        }
      }
    }
  }
};
