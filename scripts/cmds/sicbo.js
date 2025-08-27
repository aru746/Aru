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
      return message.reply("🙊 | Choose 'small' or 'big'.");
    }

    if (!Number.isInteger(betAmount) || betAmount < 50) {
      return message.reply("❌ | Please bet an amount of 50 or more.");
    }

    if (betType === "big" && betAmount > 100_000_000) {
      return message.reply("⚠️ | Maximum bet for 'Big' is 100,000,000.");
    }
    if (betType === "small" && betAmount > 10_000_000) {
      return message.reply("⚠️ | Maximum bet for 'Small' is 10,000,000.");
    }

    if (betAmount > userData.money) {
      return message.reply("❌ | You don't have enough money to make that bet.");
    }

    const dice = [1, 2, 3, 4, 5, 6];
    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(dice[Math.floor(Math.random() * dice.length)]);
    }
    const resultString = results.join(" | ");

    const winRates = { big: 0.25, small: 0.40 };
    const isWin = Math.random() < winRates[betType];

    if (isWin) {
      const winAmount = betAmount;
      userData.money += winAmount;
      await usersData.set(user, userData);
      return message.reply(
        `(\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n🎉 | Congratulations! You won ${winAmount.toLocaleString()}!`
      );
    } else {
      userData.money -= betAmount;
      await usersData.set(user, userData);
      return message.reply(
        `(\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n😿 | You lost ${betAmount.toLocaleString()}.`
      );
    }
  }
};
