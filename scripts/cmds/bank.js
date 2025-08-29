const mongoose = require("mongoose");

// MongoDB connection string
const dbURI = "mongodb+srv://sonalitravel87:XuVzWW3Kcta9muU0@cluster1.tyoqc.mongodb.net/bankSystem?retryWrites=true&w=majority&appName=Cluster1";

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("[MongoDB] Connected successfully"))
  .catch((err) => console.error("[MongoDB] Connection error:", err));

// Define the Bank schema
const bankSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  bank: { type: Number, default: 0 },
  lastInterestClaimed: { type: Date, default: Date.now },
  loan: { type: Number, default: 0 },
  loanPayed: { type: Boolean, default: true },
});

// Create a model for the Bank schema
const Bank = mongoose.models.Bank || mongoose.model("Bank", bankSchema);

module.exports = {
  config: {
    name: "bank",
    version: "1.3",
    description: "Deposit, withdraw, transfer money and earn interest",
    guide: {
      en: "{pn} deposit <amount>\n{pn} withdraw <amount>\n{pn} balance\n{pn} interest\n{pn} transfer @user <amount>\n{pn} top",
    },
    category: "Economy",
    countDown: 5,
    role: 0,
    author: "Loufi | SiAM | Samuel | Abir | Arijit",
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const userID = event.senderID;

    // Fetch or create user bank data
    let userBankData = await Bank.findOne({ userID });
    if (!userBankData) {
      userBankData = await Bank.create({ userID });
    }

    switch (command) {
      // Deposit
      case "deposit":
      case "-d": {
        if (isNaN(amount) || amount <= 0)
          return message.reply("❌ Please enter a valid amount to deposit.");

        const userMoney = await usersData.get(userID, "money");
        if (userMoney < amount)
          return message.reply("❌ You don't have enough money to deposit.");

        userBankData.bank += amount;
        await userBankData.save();
        await usersData.set(userID, { money: userMoney - amount });

        return message.reply(`✅ Successfully deposited $${formatNumberWithFullForm(amount)}.`);
      }

      // Withdraw
      case "withdraw":
      case "-w": {
        if (isNaN(amount) || amount <= 0)
          return message.reply("❌ Please enter the correct amount to withdraw.");

        if (userBankData.bank < amount)
          return message.reply("❌ You don't have enough money in your bank to withdraw.");

        userBankData.bank -= amount;
        await userBankData.save();

        const updatedMoney = await usersData.get(userID, "money");
        await usersData.set(userID, { money: updatedMoney + amount });

        return message.reply(`✅ Withdrew $${formatNumberWithFullForm(amount)}. New bank: $${formatNumberWithFullForm(userBankData.bank)}.`);
      }

      // Balance
      case "balance":
      case "bal": {
        return message.reply(`𝐘𝐨𝐮𝐫 𝐛𝐚𝐧𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${formatNumberWithFullForm(userBankData.bank)}`);
      }

      // Interest
      case "interest":
      case "i": {
        const interestRate = 0.001; // 0.1% daily
        const lastClaimed = userBankData.lastInterestClaimed || Date.now();
        const timeElapsed = (Date.now() - lastClaimed) / (1000 * 60 * 60 * 24);

        if (timeElapsed < 1) {
          return message.reply("🕒 You can claim interest only once every 24 hours.");
        }

        const interest = userBankData.bank * interestRate * Math.floor(timeElapsed);
        userBankData.bank += interest;
        userBankData.lastInterestClaimed = Date.now();
        await userBankData.save();

        return message.reply(`🎀 You earned $${formatNumberWithFullForm(interest)} interest. New balance: $${formatNumberWithFullForm(userBankData.bank)}.`);
      }

      // Transfer
      case "transfer":
      case "-t": {
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❌ Please enter a valid amount to transfer.");
        }

        let recipientUID;
        if (event.type === "message_reply") {
          recipientUID = event.messageReply.senderID;
        } else if (Object.keys(event.mentions).length > 0) {
          recipientUID = Object.keys(event.mentions)[0];
        } else {
          return message.reply("❌ Please mention or reply to the user you want to transfer money to.");
        }

        if (recipientUID === userID) {
          return message.reply("❌ You cannot transfer money to yourself.");
        }

        if (userBankData.bank < amount) {
          return message.reply("❌ You don't have enough money in your bank to transfer.");
        }

        let recipientBankData = await Bank.findOne({ userID: recipientUID });
        if (!recipientBankData) {
          recipientBankData = await Bank.create({ userID: recipientUID });
        }

        userBankData.bank -= amount;
        recipientBankData.bank += amount;

        await userBankData.save();
        await recipientBankData.save();

        const senderName = await usersData.get(userID, "name");
        const recipientName = await usersData.get(recipientUID, "name");

        return message.reply(`✅ ${boldText(senderName)} transferred $${formatNumberWithFullForm(amount)} to ${boldText(recipientName)}.`);
      }

      // Top leaderboard
      case "top": {
        const topUsers = await Bank.find().sort({ bank: -1 }).limit(15);
        const medals = ["🥇", "🥈", "🥉"];

        const leaderboard = await Promise.all(topUsers.map(async (user, index) => {
          const userName = await usersData.get(user.userID, "name");
          const boldName = boldText(userName);
          let rank;
          if (index < 3) {
            rank = medals[index];
          } else {
            const numberMap = { "0": "𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗" };
            rank = String(index + 1).split("").map(d => numberMap[d] || d).join("") + ".";
          }
          return `${rank} ${boldName} - $${formatNumberWithFullForm(user.bank)}`;
        }));

        return message.reply(`[ 🏦 ALYA BANK 🏦 ]\n\n👑  | 𝐓𝐨𝐩 𝟏𝟓 𝐫𝐢𝐜𝐡𝐞𝐬𝐭 𝐛𝐚𝐧𝐤 𝐮𝐬𝐞𝐫𝐬 :\n\n${leaderboard.join("\n")}`);
      }

      // Help menu
      default:
        return message.reply(
          `╭─[🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦]
│❀ 𝐁𝐚𝐥𝐚𝐧𝐜𝐞
│❀ 𝐃𝐞𝐩𝐨𝐬𝐢𝐭
│❀ 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰
│❀ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭
│❀ 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫
│❀ 𝐓𝐨𝐩
╰────────────⭓`
        );
    }
  },
};

// ✅ Format numbers with bold suffixes
function formatNumberWithFullForm(number) {
  number = Number(number);
  const fullForms = ["", "𝗞", "𝗠", "𝗕", "𝗧", "𝗤"];
  let index = 0;

  while (number >= 1000 && index < fullForms.length - 1) {
    number /= 1000;
    index++;
  }

  return `${number.toFixed(1)}${fullForms[index]}`;
}

// ✅ Convert text into bold Unicode
function boldText(str) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bold =   "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭" +
                 "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" +
                 "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟟𝟠𝟡";
  return str.split("").map(c => {
    const i = normal.indexOf(c);
    return i !== -1 ? bold[i] : c;
  }).join("");
}
