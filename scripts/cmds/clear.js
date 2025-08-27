module.exports = {
  config: {
    name: "clear",
    aliases: ["unsendall", "purge"],
    author: "kshitiz",
    version: "2.1",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Clear bot messages"
    },
    longDescription: {
      en: "Unsend all messages sent by the bot in the current thread"
    },
    category: "𝗕𝗢𝗫",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadID;
    const botID = api.getCurrentUserID();
    let count = 0;
    let before = null;

    try {
      while (true) {
        // get last 100 messages
        const history = await api.getThreadHistory(threadID, 100, before);
        if (!history || history.length === 0) break;

        const botMessages = history.filter(m => m.senderID === botID && m.messageID);

        for (const msg of botMessages) {
          try {
            await api.unsendMessage(msg.messageID);
            count++;
          } catch (e) {
            console.error("Failed to unsend:", e);
          }
        }

        before = history[history.length - 1]?.messageID;
        if (!before) break; // stop if no more messages
      }

      await message.reply(`✅ | Cleared ${count} bot messages from this chat.`);
    } catch (err) {
      console.error(err);
      await message.reply("❌ | Failed to clear messages, please try again.");
    }
  }
};
