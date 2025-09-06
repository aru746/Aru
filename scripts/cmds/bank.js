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
    category: "group",
    countDown: 5,
    role: 0,
    author: "[Loufi + Siam + Samuel + Abir + Arijit]",
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
          return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐨 𝐝𝐞𝐩𝐨𝐬𝐢𝐭.");

        const userMoney = await usersData.get(userID, "money") || 0;
        if (userMoney < amount)
          return message.reply("❌ 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆 𝘁𝗼 𝗱𝗲𝗽𝗼𝘀𝗶𝘁.");

        userBankData.bank += amount;
        await userBankData.save();
        await usersData.set(userID, { money: userMoney - amount });

        return message.reply(`✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐞𝐝: $${formatNumberWithFullForm(amount)}.`);
      }

      // Withdraw
      case "withdraw":
      case "-w": {
        if (isNaN(amount) || amount <= 0)
          return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐨 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰.");

        if (userBankData.bank < amount)
          return message.reply("❌ 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆 𝗶𝗻 𝘆𝗼𝘂𝗿 𝗯𝗮𝗻𝗸 𝘁𝗼 𝘄𝗶𝘁𝗵𝗱𝗿𝗮𝘄.");

        userBankData.bank -= amount;
        await userBankData.save();

        const updatedMoney = await usersData.get(userID, "money") || 0;
        await usersData.set(userID, { money: updatedMoney + amount });

        return message.reply(`✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐰𝐢𝐭𝐡𝐝𝐫𝐞𝐰: $${formatNumberWithFullForm(amount)}.`);
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
        const lastClaimed = new Date(userBankData.lastInterestClaimed).getTime();
        const timeElapsed = (Date.now() - lastClaimed) / (1000 * 60 * 60 * 24);

        if (timeElapsed < 1) {
          return message.reply("🕒 𝗬𝗼𝘂 𝗰𝗮𝗻 𝗰𝗹𝗮𝗶𝗺 𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 𝗼𝗻𝗹𝘆 𝗼𝗻𝗰𝗲 𝗲𝘃𝗲𝗿𝘆 24 𝗵𝗼𝘂𝗿𝘀.");
        }

        const interest = userBankData.bank * interestRate * Math.floor(timeElapsed);
        userBankData.bank += interest;
        userBankData.lastInterestClaimed = Date.now();
        await userBankData.save();

        return message.reply(`🎀 𝗕𝗮𝗯𝘆 𝘆𝗼𝘂 𝗲𝗮𝗿𝗻𝗲𝗱 $${formatNumberWithFullForm(interest)} 𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁.\n🎀 𝗡𝗲𝘄 𝗯𝗮𝗹𝗮𝗻𝗰𝗲: $${formatNumberWithFullForm(userBankData.bank)}.`);
      }

      // Transfer
      case "transfer":
      case "-t": {
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐨 𝘁𝗿𝗮𝗻𝘀𝗳𝗲𝗿.");
        }

        let recipientUID;
        if (event.type === "message_reply") {
          recipientUID = event.messageReply.senderID;
        } else if (Object.keys(event.mentions).length > 0) {
          recipientUID = Object.keys(event.mentions)[0];
        } else {
          return message.reply("❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗺𝗲𝗻𝘁𝗶𝗼𝗻 𝗼𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝘁𝗵𝗲 𝘂𝘀𝗲𝗿 𝘆𝗼𝘂 𝘄𝗮𝗻𝘁 𝘁𝗼 𝘁𝗿𝗮𝗻𝘀𝗳𝗲𝗿 𝗺𝗼𝗻𝗲𝘆 𝘁𝗼.");
        }

        if (recipientUID === userID) {
          return message.reply("❌ 𝗬𝗼𝘂 𝗰𝗮𝗻𝗻𝗼𝘁 𝘁𝗿𝗮𝗻𝘀𝗳𝗲𝗿 𝗺𝗼𝗻𝗲𝘆 𝘁𝗼 𝘆𝗼𝘂𝗿𝘀𝗲𝗹𝗳.");
        }

        if (userBankData.bank < amount) {
          return message.reply("❌ 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆 𝗶𝗻 𝘆𝗼𝘂𝗿 𝗯𝗮𝗻𝗸 𝘁𝗼 𝘁𝗿𝗮𝗻𝘀𝗳𝗲𝗿.");
        }

        let recipientBankData = await Bank.findOne({ userID: recipientUID });
        if (!recipientBankData) {
          recipientBankData = await Bank.create({ userID: recipientUID });
        }

        userBankData.bank -= amount;
        recipientBankData.bank += amount;

        await userBankData.save();
        await recipientBankData.save();

        const senderName = await usersData.get(userID, "name") || "Unknown";
        const recipientName = await usersData.get(recipientUID, "name") || "Unknown";

        return message.reply(`✅ ${toBoldUnicode(senderName)} 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫𝐫𝐞𝐝 $${formatNumberWithFullForm(amount)} 𝐭𝐨 ${toBoldUnicode(recipientName)}.`);
      }

      // Top leaderboard
      case "top": {
        const topUsers = await Bank.find().sort({ bank: -1 }).limit(15);
        const medals = ["🥇", "🥈", "🥉"];

        const leaderboard = await Promise.all(topUsers.map(async (user, index) => {
          const userName = await usersData.get(user.userID, "name") || "Unknown";
          const boldName = toBoldUnicode(userName);
          let rank;
          if (index < 3) {
            rank = medals[index];
          } else {
            const numberMap = { "0": "𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗" };
            rank = String(index + 1).split("").map(d => numberMap[d] || d).join("") + ".";
          }
          return `${rank} ${boldName} - $${formatNumberWithFullForm(user.bank)}`;
        }));

        return message.reply(`[ 🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦 ]\n\n👑 | 𝐓𝐨𝐩 𝟏𝟓 𝐫𝐢𝐜𝐡𝐞𝐬𝐭 𝐛𝐚𝐧𝐤 𝐮𝐬𝐞𝐫𝐬:\n\n${leaderboard.join("\n")}`);
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
  const fullForms = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"]; // Bold suffixes
  let index = 0;

  while (number >= 1000 && index < fullForms.length - 1) {
    number /= 1000;
    index++;
  }

  return `${number.toFixed(1)}${fullForms[index]}`;
}

// ✅ Unicode bold converter
function toBoldUnicode(name) {
  const boldAlphabet = {
    "a": "𝐚","b": "𝐛","c": "𝐜","d": "𝐝","e": "𝐞","f": "𝐟","g": "𝐠","h": "𝐡","i": "𝐢","j": "𝐣",
    "k": "𝐤","l": "𝐥","m": "𝐦","n": "𝐧","o": "𝐨","p": "𝐩","q": "𝐪","r": "𝐫","s": "𝐬","t": "𝐭",
    "u": "𝐮","v": "𝐯","w": "𝐰","x": "𝐱","y": "𝐲","z": "𝐳",
    "A": "𝐀","B": "𝐁","C": "𝐂","D": "𝐃","E": "𝐄","F": "𝐅","G": "𝐆","H": "𝐇","I": "𝐈","J": "𝐉",
    "K": "𝐊","L": "𝐋","M": "𝐌","N": "𝐍","O": "𝐎","P": "𝐏","Q": "𝐐","R": "𝐑","S": "𝐒","T": "𝐓",
    "U": "𝐔","V": "𝐕","W": "𝐖","X": "𝐗","Y": "𝐘","Z": "𝐙",
    "0": "0","1": "1","2": "2","3": "3","4": "4","5": "5","6": "6","7": "7","8": "8","9": "9",
    " ": " ","'": "'",
    ",": ",",".": ".","-": "-","!": "!","?": "?"
  };
  return name.split('').map(char => boldAlphabet[char] || char).join('');
}
