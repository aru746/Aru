// Store play history
const playHistory = new Map();

module.exports = {
  config: {
    name: "sicbo",
    aliases: ["sic"],
    version: "1.2",
    author: "Loid Butter & Arijit",
    countDown: 10,
    role: 0,
    shortDescription: "Play Sicbo, the oldest gambling game",
    longDescription: "Play Sicbo, the oldest gambling game, and earn money",
    category: "game",
    guide: "{pn} <Small/Big> <amount of money>"
  },

  onStart: async function ({ args, message, usersData, event }) {
    const betType = args[0]?.toLowerCase();
    const betAmount = parseInt(args[1]);
    const user = event.senderID;
    const userData = await usersData.get(user);

    // --- Cooldown system: 15 games per 1h ---
    const now = Date.now();
    if (!playHistory.has(user)) {
      playHistory.set(user, []);
    }
    let history = playHistory.get(user);

    // Remove old plays beyond 1h
    history = history.filter(t => now - t < 60 * 60 * 1000);

    if (history.length >= 15) {
      const firstPlay = history[0];
      const remaining = 60 * 60 * 1000 - (now - firstPlay);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      return message.reply(
        `❌ | You have reached your Sicbo limit (15 plays per hour).\n` +
        `⏳ Try again in ${minutes}m ${seconds}s.`
      );
    }

    // Record this play
    history.push(now);
    playHistory.set(user, history);

    // --- Game logic ---
    if (!["small", "big"].includes(betType)) {
      return message.reply("🙊 | 𝐂𝐡𝐨𝐨𝐬𝐞 '𝐬𝐦𝐚𝐥𝐥' 𝐨𝐫 '𝐛𝐢𝐠'.");
    }

    if (!Number.isInteger(betAmount) || betAmount < 50) {
      return message.reply("❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐛𝐞𝐭 𝐚𝐧 𝐚𝐦𝐨𝐮𝐧𝐭 𝐨𝐟 50 𝐨𝐫 𝐦𝐨𝐫𝐞.");
    }

    if (betType === "big" && betAmount > 100_000_000) {
      return message.reply("⚠️ | 𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐛𝐞𝐭 𝐟𝐨𝐫 '𝐁𝐢𝐠' 𝐢𝐬 100,000,000.");
    }
    if (betType === "small" && betAmount > 10_000_000) {
      return message.reply("⚠️ | 𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐛𝐞𝐭 𝐟𝐨𝐫 '𝐒𝐦𝐚𝐥𝐥' 𝐢𝐬 10,000,000.");
    }

    if (betAmount > userData.money) {
      return message.reply("❌ | 𝐘𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐦𝐨𝐧𝐞𝐲 𝐭𝐨 𝐦𝐚𝐤𝐞 𝐭𝐡𝐚𝐭 𝐛𝐞𝐭.");
    }

    const dice = [1, 2, 3, 4, 5, 6];
    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(dice[Math.floor(Math.random() * dice.length)]);
    }
    const resultString = results.join(" | ");

    const winRates = { big: 0.40, small: 0.45 };
    const isWin = Math.random() < winRates[betType];

    if (isWin) {
      const winAmount = betAmount;
      userData.money += winAmount;
      await usersData.set(user, userData);
      return message.reply(
        `(\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n🎉 | 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬! 𝐘𝐨𝐮 𝐰𝐨𝐧 ${winAmount.toLocaleString()}!`
      );
    } else {
      userData.money -= betAmount;
      await usersData.set(user, userData);
      return message.reply(
        `(\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n😿 | 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 ${betAmount.toLocaleString()}.`
      );
    }
  }
};
