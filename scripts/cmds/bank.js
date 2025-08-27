const Bank = require("../../models/bankSchema");

module.exports = {
  config: {
    name: "bank",
    aliases: ["alya-bank"],
    version: "3.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Alya Bank system",
    longDescription: "Deposit, withdraw, transfer, loan, and manage your Alya Bank balance",
    category: "economy",
    guide: {
      en: "{pn} [balance|deposit|withdraw|transfer|top|loan|payloan] [amount|uid]"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const userID = event.senderID;

    // Fetch or create user bank data
    let userBankData = await Bank.findOne({ userID });
    if (!userBankData) {
      userBankData = await Bank.create({ userID });
    }

    // Show menu if no command
    if (!command) {
      return message.reply(
        `╭─[🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦]\n` +
        `│❀ 𝐁𝐚𝐥𝐚𝐧𝐜𝐞\n` +
        `│❀ 𝐃𝐞𝐩𝐨𝐬𝐢𝐭\n` +
        `│❀ 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰\n` +
        `│❀ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭\n` +
        `│❀ 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫\n` +
        `│❀ 𝐓𝐨𝐩\n` +
        `│❀ 𝐋𝐨𝐚𝐧\n` +
        `│❀ 𝐏𝐚𝐲𝐋𝐨𝐚𝐧\n` +
        `╰────────────⭓`
      );
    }

    // BALANCE
    if (command === "balance") {
      const name = await usersData.getName(userID);
      return message.reply(
        `🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊\n\n` +
        `👤 𝐔𝐬𝐞𝐫: **${name}**\n` +
        `💰 𝐁𝐚𝐧𝐤 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: **$${userBankData.balance.toLocaleString()}**`
      );
    }

    // DEPOSIT
    if (command === "deposit") {
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Please enter a valid amount.");
      if (userBankData.cash < amount) return message.reply("❌ You don’t have enough cash.");

      userBankData.cash -= amount;
      userBankData.balance += amount;
      await userBankData.save();

      return message.reply(
        `✅ Successfully deposited **$${amount.toLocaleString()}**\n` +
        `🏦 New Bank Balance: **$${userBankData.balance.toLocaleString()}**`
      );
    }

    // WITHDRAW
    if (command === "withdraw") {
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Please enter a valid amount.");
      if (userBankData.balance < amount) return message.reply("❌ You don’t have enough in bank.");

      userBankData.balance -= amount;
      userBankData.cash += amount;
      await userBankData.save();

      return message.reply(
        `✅ Successfully withdrew **$${amount.toLocaleString()}**\n` +
        `🏦 Remaining Bank Balance: **$${userBankData.balance.toLocaleString()}**`
      );
    }

    // TRANSFER
    if (command === "transfer") {
      const targetID = args[2];
      if (!targetID) return message.reply("❌ Please enter a target UID.");
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
      if (userBankData.balance < amount) return message.reply("❌ Insufficient balance.");

      let targetData = await Bank.findOne({ userID: targetID });
      if (!targetData) targetData = await Bank.create({ userID: targetID });

      userBankData.balance -= amount;
      targetData.balance += amount;
      await userBankData.save();
      await targetData.save();

      const senderName = await usersData.getName(userID);
      const receiverName = await usersData.getName(targetID);

      return message.reply(
        `💸 Transfer Successful!\n\n` +
        `👤 From: **${senderName}**\n` +
        `👤 To: **${receiverName}**\n` +
        `💰 Amount: **$${amount.toLocaleString()}**`
      );
    }

    // TOP LIST
    if (command === "top") {
      const topUsers = await Bank.find().sort({ balance: -1 }).limit(15);
      let msg = `[🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦]\n👑 𝐓𝐨𝐩 𝟏𝟓 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬 👑\n━━━━━━━━━━━\n`;

      for (let i = 0; i < topUsers.length; i++) {
        const name = await usersData.getName(topUsers[i].userID);
        msg += `#${i + 1} • **${name}** → **$${topUsers[i].balance.toLocaleString()}**\n`;
      }

      return message.reply(msg);
    }

    // LOAN
    if (command === "loan") {
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid loan amount.");
      userBankData.loan += amount;
      userBankData.balance += amount;
      await userBankData.save();

      return message.reply(
        `✅ Loan Approved!\n` +
        `💰 Loan Taken: **$${amount.toLocaleString()}**\n` +
        `🏦 Bank Balance: **$${userBankData.balance.toLocaleString()}**`
      );
    }

    // PAYLOAN
    if (command === "payloan") {
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
      if (userBankData.balance < amount) return message.reply("❌ Not enough in bank.");
      if (userBankData.loan <= 0) return message.reply("❌ You don’t have any loan.");

      userBankData.balance -= amount;
      userBankData.loan -= amount;
      if (userBankData.loan < 0) userBankData.loan = 0;
      await userBankData.save();

      return message.reply(
        `✅ Loan Payment Successful!\n` +
        `💸 Paid: **$${amount.toLocaleString()}**\n` +
        `Remaining Loan: **$${userBankData.loan.toLocaleString()}**`
      );
    }

    return message.reply("❌ Invalid command. Type **bank** to see available options.");
  }
};
