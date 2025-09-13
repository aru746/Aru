const mongoose = require("mongoose");

// === Schemas & Models ===
const botBalanceSchema = new mongoose.Schema({
  _id: { type: String, default: "main" },
  balance: { type: Number, default: 0 }
});

const diceLimitSchema = new mongoose.Schema({
  userId: String,
  plays: { type: Number, default: 0 },
  reset: Number
});

const BotBalance = mongoose.models.BotBalance || mongoose.model("BotBalance", botBalanceSchema);
const DiceLimit = mongoose.models.DiceLimit || mongoose.model("DiceLimit", diceLimitSchema);

// === Helpers ===
function formatMoney(amount) {
  if (amount >= 1e15) return (amount / 1e15).toFixed(2).replace(/\.0+$/, "") + "Q";
  if (amount >= 1e12) return (amount / 1e12).toFixed(2).replace(/\.0+$/, "") + "T";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2).replace(/\.0+$/, "") + "B";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2).replace(/\.0+$/, "") + "M";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2).replace(/\.0+$/, "") + "K";
  return amount.toString();
}

function parseBet(input) {
  if (!input) return NaN;
  input = input.toString().toUpperCase();
  const match = input.match(/^(\d+(?:\.\d+)?)([KMBTQ]?)$/);
  if (!match) return NaN;

  let amount = parseFloat(match[1]);
  const suffix = match[2];
  switch (suffix) {
    case "K": amount *= 1e3; break;
    case "M": amount *= 1e6; break;
    case "B": amount *= 1e9; break;
    case "T": amount *= 1e12; break;
    case "Q": amount *= 1e15; break;
  }
  return Math.floor(amount);
}

module.exports = {
  config: {
    name: "dice",
    version: "4.0",
    author: "Arijit",
    role: 0,
    shortDescription: "Play dice against bot",
    longDescription: "Roll a dice against the bot. Higher number wins the bet.",
    category: "game",
    guide: "{pn} <amount>"
  },

  onStart: async function ({ event, message, args }) {
    const bet = parseBet(args[0]);
    if (isNaN(bet) || bet <= 0) return message.reply("❌ Please enter a valid bet amount!");
    if (bet > 50000000) return message.reply("❌ | 𝐓𝐡𝐞 𝐦𝐚𝐱𝐢𝐦𝐮𝐦 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭 𝐢𝐬 𝟓𝟎𝐌.");

    const userId = event.senderID;
    const now = Date.now();
    const hour = 60 * 60 * 1000;

    // === check/init dice limit ===
    let limitData = await DiceLimit.findOne({ userId });
    if (!limitData) limitData = new DiceLimit({ userId, plays: 0, reset: now + hour });
    if (now > limitData.reset) { limitData.plays = 0; limitData.reset = now + hour; }
    if (limitData.plays >= 10) {
      const msLeft = limitData.reset - now;
      const h = Math.floor(msLeft / 3600000);
      const m = Math.floor((msLeft % 3600000) / 60000);
      return message.reply(`❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐝𝐢𝐜𝐞 𝐥𝐢𝐦𝐢𝐭. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${h}𝐡 ${m}𝐦.`);
    }

    limitData.plays += 1;
    await limitData.save();

    // === init bot balance ===
    let botBalance = await BotBalance.findById("main");
    if (!botBalance) { botBalance = new BotBalance({ _id: "main", balance: 0 }); await botBalance.save(); }

    // === roll dice instantly ===
    const userRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    let resultMsg = `🎲 𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝: ${userRoll}\n🤖 𝐁𝐨𝐭 𝐫𝐨𝐥𝐥𝐞𝐝: ${botRoll}\n\n`;
    if (userRoll > botRoll) {
      botBalance.balance -= bet;
      await botBalance.save();
      resultMsg += `• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatMoney(bet)} ✨`;
    } else if (userRoll < botRoll) {
      botBalance.balance += bet;
      await botBalance.save();
      resultMsg += `• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 ${formatMoney(bet)} 🥺`;
    } else {
      resultMsg += `• 𝐈𝐭'𝐬 𝐚 𝐝𝐫𝐚𝐰! 😮`;
    }

    return message.reply(resultMsg);
  }
};
