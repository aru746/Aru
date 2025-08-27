const mongoose = require("mongoose");

// ====== Bank Schema ======
const bankSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 },
  interest: { type: Number, default: 0 }
});

const Bank = mongoose.models.Bank || mongoose.model("Bank", bankSchema);

module.exports = {
  config: {
    name: "bank",
    version: "3.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Bank system",
    longDescription: "Check balance, deposit, withdraw, interest, transfer, loan, payloan, and top richest users.",
    category: "economy",
    guide: "{pn} [balance|deposit|withdraw|interest|transfer|loan|payloan|top]"
  },

  onStart: async function ({ message, event, usersData, args }) {
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    // Ensure user account exists
    let userAcc = await Bank.findOne({ userID: senderID });
    if (!userAcc) {
      userAcc = new Bank({ userID: senderID });
      await userAcc.save();
    }

    const action = args[0]?.toLowerCase();

    // Menu
    if (!action) {
      return message.reply(
`╭─[🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦]
│❀ 𝐁𝐚𝐥𝐚𝐧𝐜𝐞
│❀ 𝐃𝐞𝐩𝐨𝐬𝐢𝐭
│❀ 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰
│❀ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭
│❀ 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫
│❀ 𝐓𝐨𝐩
│❀ 𝐋𝐨𝐚𝐧
│❀ 𝐏𝐚𝐲𝐋𝐨𝐚𝐧
╰────────────⭓`
      );
    }

    // BALANCE
    if (action === "balance") {
      return message.reply(
`╭─[🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦]
│
│‣ 𝐔𝐬𝐞𝐫: **${senderName}**
│‣ 𝐁𝐚𝐧𝐤 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: **${userAcc.balance}**💰
│‣ 𝐋𝐨𝐚𝐧: **${userAcc.loan}**💵
╰────────────⭓`
      );
    }

    // DEPOSIT
    if (action === "deposit") {
      const amount = parseInt(args[1]);
      if (!amount || amount <= 0) return message.reply("❌ | Enter a valid amount.");
      userAcc.balance += amount;
      await userAcc.save();
      return message.reply(`✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐞𝐝 **${amount}**💰`);
    }

    // WITHDRAW
    if (action === "withdraw") {
      const amount = parseInt(args[1]);
      if (!amount || amount <= 0) return message.reply("❌ | Enter a valid amount.");
      if (userAcc.balance < amount) return message.reply("❌ | Not enough balance.");
      userAcc.balance -= amount;
      await userAcc.save();
      return message.reply(`✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰𝐧 **${amount}**💰`);
    }

    // INTEREST
    if (action === "interest") {
      const gain = Math.floor(userAcc.balance * 0.05);
      userAcc.balance += gain;
      await userAcc.save();
      return message.reply(`💹 | 𝐘𝐨𝐮 𝐠𝐨𝐭 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭: **${gain}**💰`);
    }

    // TRANSFER
    if (action === "transfer") {
      const targetID = Object.keys(event.mentions)[0];
      const amount = parseInt(args[2]);
      if (!targetID) return message.reply("❌ | Mention someone to transfer.");
      if (!amount || amount <= 0) return message.reply("❌ | Invalid amount.");
      if (userAcc.balance < amount) return message.reply("❌ | Not enough balance.");
      let targetAcc = await Bank.findOne({ userID: targetID });
      if (!targetAcc) {
        targetAcc = new Bank({ userID: targetID });
        await targetAcc.save();
      }
      userAcc.balance -= amount;
      targetAcc.balance += amount;
      await userAcc.save();
      await targetAcc.save();
      const targetName = await usersData.getName(targetID);
      return message.reply(`✅ | 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫𝐫𝐞𝐝 **${amount}**💰 𝐭𝐨 **${targetName}**`);
    }

    // LOAN
    if (action === "loan") {
      const amount = parseInt(args[1]);
      if (!amount || amount <= 0) return message.reply("❌ | Enter valid amount.");
      userAcc.loan += amount;
      userAcc.balance += amount;
      await userAcc.save();
      return message.reply(`💵 | 𝐘𝐨𝐮 𝐭𝐨𝐨𝐤 𝐚 𝐥𝐨𝐚𝐧 𝐨𝐟 **${amount}**💰`);
    }

    // PAYLOAN
    if (action === "payloan") {
      const amount = parseInt(args[1]);
      if (!amount || amount <= 0) return message.reply("❌ | Enter valid amount.");
      if (userAcc.balance < amount) return message.reply("❌ | Not enough balance.");
      if (userAcc.loan < amount) return message.reply("❌ | You don't owe that much.");
      userAcc.loan -= amount;
      userAcc.balance -= amount;
      await userAcc.save();
      return message.reply(`✅ | 𝐘𝐨𝐮 𝐩𝐚𝐢𝐝 𝐥𝐨𝐚𝐧: **${amount}**💰`);
    }

    // TOP
    if (action === "top") {
      const topUsers = await Bank.find().sort({ balance: -1 }).limit(15);
      let text = "🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦\n\n👑 𝐓𝐨𝐩 𝟏𝟓 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬 👑\n━━━━━━━━━━━\n";
      let rank = 1;
      for (const acc of topUsers) {
        const name = await usersData.getName(acc.userID) || "Unknown";
        text += `#${rank} • **${name}**\n   Balance: **${acc.balance}**💰\n`;
        rank++;
      }
      return message.reply(text);
    }

  }
};
