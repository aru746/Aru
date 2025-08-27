const fs = require("fs-extra");
const path = require("path");

// Path to store autoseen state
const pathFile = path.join(__dirname, "cache", "autoseen.txt");

module.exports = {
  config: {
    name: "autoseen",
    version: "1.1.0",
    hasPermssion: 2, // Admin only
    author: "Jas + Fix by GPT",
    shortDescription: {
      en: "Toggle automatic 'seen' for new messages"
    },
    longDescription: {
      en: "Automatically marks all incoming messages as seen when enabled."
    },
    category: "Admin",
    guide: {
      en: "{pn} on/off"
    },
    cooldowns: 5
  },

  // Automatically called when a new chat event occurs
  onChat: async ({ api }) => {
    try {
      // Create file if missing, default "false"
      if (!fs.existsSync(pathFile)) {
        fs.outputFileSync(pathFile, "false");
      }

      const isEnabled = fs.readFileSync(pathFile, "utf8").trim();
      if (isEnabled === "true") {
        api.markAsReadAll(() => {});
      }
    } catch (err) {
      console.error("AutoSeen Error:", err);
    }
  },

  // Command to toggle autoseen
  onStart: async ({ api, event, args }) => {
    try {
      if (!args[0]) {
        return api.sendMessage(
          "❌ Please specify 'on' or 'off'.\nExample: autoseen on",
          event.threadID,
          event.messageID
        );
      }

      const mode = args[0].toLowerCase();
      if (mode === "on") {
        fs.outputFileSync(pathFile, "true");
        api.sendMessage("✅ AutoSeen is now ENABLED for new messages.", event.threadID, event.messageID);
      } else if (mode === "off") {
        fs.outputFileSync(pathFile, "false");
        api.sendMessage("🚫 AutoSeen is now DISABLED for new messages.", event.threadID, event.messageID);
      } else {
        api.sendMessage("❌ Invalid option. Use 'on' or 'off'.", event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("AutoSeen Command Error:", err);
      api.sendMessage("⚠️ An error occurred while toggling AutoSeen.", event.threadID, event.messageID);
    }
  }
};
