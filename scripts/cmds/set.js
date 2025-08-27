module.exports = {
  config: {
    name: "set",
    aliases: ["ap"],
    version: "1.0",
    author: "Loid Butter",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points for a user"
    },
    longDescription: {
      en: "Set coins and experience points for a user as desired"
    },
    category: "economy",
    guide: {
      en: "{pn}set [money|exp] [amount] (reply/mention user)"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    // Permission check
    const permission = ["100069254151118"]; // Allowed user IDs
    if (!permission.includes(event.senderID)) {
      return api.sendMessage(
        "❌ You don't have enough permission to use this command. Only My Lord can use it.",
        event.threadID,
        event.messageID
      );
    }

    const query = args[0];
    const amount = parseInt(args[1]);

    if (!query || isNaN(amount)) {
      return api.sendMessage(
        `❌ Invalid command arguments.\nUsage: ${this.config.guide.en}`,
        event.threadID,
        event.messageID
      );
    }

    // Get target user
    let targetUser;
    if (event.type === "message_reply" && event.messageReply) {
      targetUser = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions || {});
      targetUser = mention[0] || event.senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage(
        "❌ User not found in the database.",
        event.threadID,
        event.messageID
      );
    }

    const name = await usersData.getName(targetUser);

    // Update based on query
    if (query.toLowerCase() === "exp") {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });

      return api.sendMessage(
        `✅ Set experience points to ${amount} for ${name}.`,
        event.threadID,
        event.messageID
      );

    } else if (query.toLowerCase() === "money") {
      await usersData.set(targetUser, {
        money: amount,
        exp: userData.exp,
        data: userData.data
      });

      return api.sendMessage(
        `✅ Set coins to ${amount} for ${name}.`,
        event.threadID,
        event.messageID
      );

    } else {
      return api.sendMessage(
        "❌ Invalid query. Use 'exp' to set experience points or 'money' to set coins.",
        event.threadID,
        event.messageID
      );
    }
  }
};
