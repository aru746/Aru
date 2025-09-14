// Store play history
const playHistory = new Map();

module.exports = {
  config: {
    name: "sicbo",
    aliases: ["sic"],
    version: "1.4",
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
    const rawAmount = args[1];
    const user = event.senderID;
    const userData = await usersData.get(user);

    // --- Cooldown system: 20 games per 5h ---
    const now = Date.now();
    if (!playHistory.has(user)) {
      playHistory.set(user, []);
    }
    let history = playHistory.get(user);

    // Remove old plays beyond 5h
    history = history.filter(t => now - t < 5 * 60 * 60 * 1000);

    if (history.length >= 20) {
      const firstPlay = history[0];
      const remaining = 5 * 60 * 60 * 1000 - (now - firstPlay);
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      return message.reply(
        ❌ | You have reached your Sicbo limit (20 plays per 5 hours).\n +
        ⏳ Try again in ${hours}h ${minutes}m ${seconds}s.
      );
    }

    // Record this play
    history.push(now);
    playHistory.set(user, history);

    // --- Parse amount (supports K, M, B, T, Q) ---
    function parseAmount(input) {
      if (!input) return NaN;
      const multipliers = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15 };
      const match = input.toLowerCase().match(/^(\d+(?:\.\d+)?)([kmbtq]?)$/);
      if (!match) return NaN;
      const num = parseFloat(match[1]);
      const suffix = match[2];
      return num * (multipliers[suffix] || 1);
    }

    // Bold Unicode converter (for suffix only)
    function toBoldUnicode(char) {
      const boldMap = { K: "𝐊", M: "𝐌", B: "𝐁", T: "𝐓", Q: "𝐐" };
      return boldMap[char] || char;
    }

    // Format numbers with suffix
    function formatAmount(num) {
      if (num >= 1e15) return (num / 1e15).toFixed(2).replace(/\.0+$/, "") + toBoldUnicode("Q");
      if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.0+$/, "") + toBoldUnicode("T");
      if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.0+$/, "") + toBoldUnicode("B");
      if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.0+$/, "") + toBoldUnicode("M");
      if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.0+$/, "") + toBoldUnicode("K");
      return num.toString();
    }

    const betAmount = parseAmount(rawAmount);

    // --- Game logic ---
    if (!["small", "big"].includes(betType)) {
      return message.reply("🙊 | 𝐂𝐡𝐨𝐨𝐬𝐞 '𝐬𝐦𝐚𝐥𝐥' 𝐨𝐫 '𝐛𝐢𝐠'.");
    }

    if (!Number.isFinite(betAmount) || betAmount < 50) {
      return message.reply("❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐛𝐞𝐭 𝐚𝐧 𝐚𝐦𝐨𝐮𝐧𝐭 𝐨𝐟 50 𝐨𝐫 𝐦𝐨𝐫𝐞.");
    }

    if (betType === "big" && betAmount > 50_000_000) {
      return message.reply("⚠ | 𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐛𝐞𝐭 𝐟𝐨𝐫 '𝐁𝐢𝐠' 𝐢𝐬 50,000,000.");
    }
    if (betType === "small" && betAmount > 10_000_000) {
      return message.reply("⚠ | 𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐛𝐞𝐭 𝐟𝐨𝐫 '𝐒𝐦𝐚𝐥𝐥' 𝐢𝐬 10,000,000.");
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

    const winRates = { big: 0.37, small: 0.45, fiveX: 0.05 };
    const roll = Math.random();
    let outcome;

    if (roll < winRates.fiveX) {
      outcome = "5x";
    } else if (roll < winRates.fiveX + winRates[betType]) {
      outcome = "normal";
    } else {
      outcome = "lose";
    }
    if (outcome === "5x") {
      const winAmount = betAmount * 5;
      userData.money += winAmount;
      await usersData.set(user, userData);
      return message.reply(
        (\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n💎 | 𝐉𝐚𝐜𝐤𝐩𝐨𝐭! 𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatAmount(winAmount)}$
      );
    }

    if (outcome === "normal") {
      const winAmount = betAmount;
      userData.money += winAmount;
      await usersData.set(user, userData);
      return message.reply(
        (\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n🎉 | 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬! 𝐘𝐨𝐮 𝐰𝐨𝐧 : ${formatAmount(winAmount)}$
      );
    }

    userData.money -= betAmount;
    await usersData.set(user, userData);
    return message.reply(
      (\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n😿 | 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 ${formatAmount(betAmount)}$.
    );
  }
};
