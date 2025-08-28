const PastebinAPI = require('pastebin-js');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pastebin",
    version: "1.2",
    author: "SANDIP + Arijit",
    countDown: 5,
    role: 2, // but we override with owner check
    shortDescription: {
      en: "Upload files to Pastebin (Owner only)"
    },
    longDescription: {
      en: "Only Arijit (bot owner) can upload files to Pastebin and get a shareable link."
    },
    category: "Utility",
    guide: {
      en: "Use: !pastebin <filename>\n(Example: !pastebin mycmd.js)\nThe file must be in the 'cmds' folder."
    }
  },

  onStart: async function ({ api, event, args }) {
    // ✅ Owner-only check
    const ownerID = "100069254151118"; // Arijit’s UID

    if (event.senderID !== ownerID) {
      return api.sendMessage(
        "❌ | This command is restricted to the bot owner only.",
        event.threadID,
        event.messageID
      );
    }

    if (!args[0]) {
      return api.sendMessage("❌ | Please provide a filename!", event.threadID, event.messageID);
    }

    const pastebin = new PastebinAPI({
      api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9'
    });

    const fileName = args[0].replace(/\.js$/, ""); // remove .js if given
    const filePath = path.join(__dirname, '..', 'cmds', fileName + '.js');

    if (!fs.existsSync(filePath)) {
      return api.sendMessage("❌ | File not found in cmds folder!", event.threadID, event.messageID);
    }

    try {
      const data = fs.readFileSync(filePath, 'utf8');

      const pasteUrl = await pastebin.createPaste({
        text: data,
        title: fileName,
        format: null,
        privacy: 1 // unlisted
      });

      const rawUrl = pasteUrl.replace("pastebin.com/", "pastebin.com/raw/");

      api.sendMessage(`✅ | File uploaded to Pastebin:\n${rawUrl}`, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ | Failed to upload file to Pastebin.", event.threadID, event.messageID);
    }
  }
};
