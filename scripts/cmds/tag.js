module.exports = {
  config: {
    name: "tag",
    version: "1.0.1",
    author: "saidul",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Tag members by name"
    },
    longDescription: {
      en: "Mention group members by searching for their name in the group."
    },
    category: "general",
    guide: {
      en: "{pn} [name]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const name = args.join(" ");
    if (!name) {
      return api.sendMessage(
        "⚠️ Please provide a name to tag.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.userInfo || [];

      // Filter members whose names include the given text
      const matches = members.filter(user =>
        user.name && user.name.toLowerCase().includes(name.toLowerCase())
      );

      if (matches.length === 0) {
        return api.sendMessage(
          `❌ No members found matching "${name}".`,
          event.threadID,
          event.messageID
        );
      }

      // Prepare mentions
      const mentions = matches.map(user => ({
        tag: user.name,
        id: user.id
      }));

      const taggedNames = matches.map(user => user.name).join(", ");

      return api.sendMessage(
        {
          body: `🔖 Tagging: ${taggedNames}`,
          mentions
        },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ An error occurred while fetching group members.",
        event.threadID,
        event.messageID
      );
    }
  }
};
