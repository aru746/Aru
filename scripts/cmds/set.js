module.exports = {
  config: {
    name: "set",
    aliases: ["ap"],
    version: "1.3",
    author: "Loid Butter + modified by Arijit",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points for a user"
    },
    longDescription: {
      en: "Set coins and experience points for a user as desired"
    },
    category: "owner",
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
    let amountStr = args[1];

    if (!query || !amountStr) {
      return api.sendMessage(
        `❌ Invalid command arguments.\nUsage: ${this.config.guide.en}`,
        event.threadID,
        event.messageID
      );
    }

    // Function to parse shorthand (K, M, B, T, Q, S) and infinity
    function parseAmount(input) {
      input = input.toUpperCase();

      // Infinity cases
      const infinityCases = ["INFINITY", "0I", "0S", "0T", "0Q"];
      if (infinityCases.includes(input)) return Infinity;

      const multipliers = {
        K: 1e3,
        M: 1e6,
        B: 1e9,
        T: 1e12,
        Q: 1e15,
        S: 1e18
      };

      // Check if last char is shorthand
      const suffix = input.slice(-1);
      if (multipliers[suffix]) {
        const num = parseFloat(input.slice(0, -1));
        return isNaN(num) ? NaN : num * multipliers[suffix];
      }

      return parseFloat(input);
    }

    const amount = parseAmount(amountStr);

    if (isNaN(amount)) {
      return api.sendMessage(
        `❌ Invalid amount.\nUsage: ${this.config.guide.en}`,
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

    // Function to format number as styled shorthand
    function formatAmount(amount) {
      if (!isFinite(amount)) return "Infinity$"; // Infinity handled properly

      const tiers = [
        { value: 1e18, suffix: "𝐒" },
        { value: 1e15, suffix: "𝐐" },
        { value: 1e12, suffix: "𝐓" },
        { value: 1e9, suffix: "𝐁" },
        { value: 1e6, suffix: "𝐌" },
        { value: 1e3, suffix: "𝐊" }
      ];

      for (const tier of tiers) {
        if (amount >= tier.value) {
          const short = (amount / tier.value).toFixed(2).replace(/\.00$/, "");
          return `${short}${tier.suffix}$`;
        }
      }

      return `${amount}$`;
    }

    // Update based on query
    if (query.toLowerCase() === "exp") {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });

      return api.sendMessage(
        `✅ Set experience points to ${formatAmount(amount)} for ${name}.`,
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
        `✅ Set coins to ${formatAmount(amount)} for ${name}.`,
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
