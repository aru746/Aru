const mongoose = require("mongoose");

// === Schemas & Models ===
const botBalanceSchema = new mongoose.Schema({
  _id: { type: String, default: "main" },
  balance: { type: Number, default: 0 }
});
const userBalanceSchema = new mongoose.Schema({
  userId: String,
  balance: { type: Number, default: 0 }
});

const BotBalance = mongoose.models.BotBalance || mongoose.model("BotBalance", botBalanceSchema);
const UserBalance = mongoose.models.UserBalance || mongoose.model("UserBalance", userBalanceSchema);

module.exports = {
  config: {
    name: "sicbo",
    version: "1.0",
    author: "Arijit",
    countDown: 10,
    role: 0,
    shortDescription: "Play SicBo dice betting game",
    category: "game",
    guide: "{pn} <big|small> <amount>"
  },

  // === Utility: parse amounts like 10M, 1B ===
  parseBetAmount(input) {
    const match = input.toLowerCase().match(/^(\d+(?:\.\d+)?)([kmb])?$/);
    if (!match) return null;
    let [, num, suffix] = match;
    num = parseFloat(num);
    switch (suffix) {
      case "k": num *= 1000; break;
      case "m": num *= 1000000; break;
      case "b": num *= 1000000000; break;
    }
    return Math.floor(num);
  },

  onStart: async function({ event, message, args }) {
    if (args.length < 2) {
      return message.reply("❌ | 𝐔𝐬𝐚𝐠𝐞: !𝐬𝐢𝐜𝐛𝐨 <big|small> <amount>");
    }

    const choice = args[0].toLowerCase();
    if (!["big", "small"].includes(choice)) {
      return message.reply("❌ | 𝐘𝐨𝐮 𝐦𝐮𝐬𝐭 𝐜𝐡𝐨𝐨𝐬𝐞 𝐞𝐢𝐭𝐡𝐞𝐫 '𝐛𝐢𝐠' 𝐨𝐫 '𝐬𝐦𝐚𝐥𝐥'.");
    }

    const betAmount = this.parseBetAmount(args[1]);
    if (!betAmount || betAmount <= 0) {
      return message.reply("❌ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭.");
    }

    const userId = event.senderID;
    let user = await UserBalance.findOne({ userId });
    if (!user) {
      user = new UserBalance({ userId, balance: 0 });
      await user.save();
    }

    if (user.balance < betAmount) {
      return message.reply("❌ | 𝐘𝐨𝐮 𝐝𝐨𝐧’𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.");
    }

    // === Roll 3 dice ===
    const dice = [0, 0, 0].map(() => Math.floor(Math.random() * 6) + 1);
    const total = dice.reduce((a, b) => a + b, 0);

    // === Jackpot check (triple numbers) with 1% chance ===
    const isTriple = dice[0] === dice[1] && dice[1] === dice[2];
    const jackpotChance = Math.random() < 0.01; // 1% chance
    let win = false, jackpot = false, reward = 0;

    if (isTriple && jackpotChance) {
      jackpot = true;
      reward = betAmount * 10; // Jackpot = 10x
    } else if (choice === "big" && total >= 11 && total <= 17 && !isTriple) {
      win = true;
      reward = betAmount * 2;
    } else if (choice === "small" && total >= 4 && total <= 10 && !isTriple) {
      win = true;
      reward = betAmount * 2;
    }

    let resultMsg = `(\_/)\n( •_•)\n// >[ ${dice.join(" | ")} ]\n\n`;

    if (jackpot) {
      user.balance += reward;
      const bot = await BotBalance.findById("main") || new BotBalance();
      bot.balance -= (reward - betAmount);
      await bot.save();
      await user.save();
      resultMsg += `🎉 | 𝐉𝐚𝐜𝐤𝐩𝐨𝐭! 𝐓𝐫𝐢𝐩𝐥𝐞 𝐝𝐢𝐜𝐞! 𝐘𝐨𝐮 𝐰𝐨𝐧 : ${reward.toLocaleString()}$ 💎`;
    } else if (win) {
      user.balance += reward - betAmount;
      const bot = await BotBalance.findById("main") || new BotBalance();
      bot.balance -= (reward - betAmount);
      await bot.save();
      await user.save();
      resultMsg += `🎉 | 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬! 𝐘𝐨𝐮 𝐰𝐨𝐧 : ${reward.toLocaleString()}$`;
    } else {
      user.balance -= betAmount;
      const bot = await BotBalance.findById("main") || new BotBalance();
      bot.balance += betAmount;
      await bot.save();
      await user.save();
      resultMsg += `😢 | 𝐒𝐨𝐫𝐫𝐲! 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 : ${betAmount.toLocaleString()}$`;
    }

    return message.reply(resultMsg);
  }
};
