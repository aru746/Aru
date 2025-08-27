const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "autoreact_data.json");

// Load existing data or create an empty file
let autoReactStatus = {};
if (fs.existsSync(DATA_FILE)) {
  autoReactStatus = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(autoReactStatus, null, 2));
}

module.exports = {
  config: {
    name: "autoreact",
    aliases: ["ar"],
    version: "3.1",
    author: "Arafat",
    countDown: 0,
    role: 0,
    shortDescription: { en: "Toggle auto emoji react" },
    longDescription: { en: "Turn on/off auto random emoji reaction in a thread" },
    category: "fun",
    guide: { en: "#autoreact on\n#autoreact off" }
  },

  onStart: async function ({ message, args, event }) {
    const threadID = event.threadID;
    const action = args[0]?.toLowerCase();

    if (action === "on") {
      autoReactStatus[threadID] = true;
      saveData();
      return message.reply("✅ Auto React has been turned **ON** for this thread.");
    }

    if (action === "off") {
      autoReactStatus[threadID] = false;
      saveData();
      return message.reply("❌ Auto React has been turned **OFF** for this thread.");
    }

    return message.reply("⚠ Please use: `#autoreact on` or `#autoreact off`");
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const isEnabled = autoReactStatus[threadID];

    if (!isEnabled) return;

    const emojis = [
      "❤", "👍", "😆", "😮", "😢", "😠",
      "😂", "🤣", "😍", "😘", "😎", "🔥",
      "💯", "✨", "🥳", "🤯", "😇", "😈",
      "🙃", "😏", "💔", "🫶", "😳", "🤡",
      "🐸", "🪳", "🌸", "💀", "🥵", "🤪",
      "🥸", "🙍‍♀", "🙆‍♀", "👧", "🧛‍♀",
      "🏃‍♀", "🥰", "🥺", "😭"
    ];
    
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    try {
      await api.setMessageReaction(randomEmoji, event.messageID, null, true);
    } catch (err) {
      console.error("React failed:", err);
    }
  }
};
