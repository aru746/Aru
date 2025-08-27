const fs = require("fs-extra");

module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["send", "s-m", "Send-m"],
    version: "2.6.1",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Send money to a user",
    longDescription: "Send money by replying to a message, mentioning user, or using UID",
    category: "economy",
    guide: "{pn} <amount> (as reply)\n{pn} @user <amount>\n{pn} <UID> <amount>"
  },

  onStart: async function ({ event, message, args, usersData, prefix }) {
    const senderID = event.senderID;
    let amount = null;
    let recipientID = null;

    // Remove command from args if included
    if (args[0] && args[0].toLowerCase().startsWith("send")) args.shift();

    // Case 1: Reply + amount
    if (event.messageReply) {
      if (args.length === 1 && !isNaN(args[0])) {
        amount = parseInt(args[0]);
        recipientID = event.messageReply.senderID;
      }
    }
    // Case 2: Mention + amount
    else if (Object.keys(event.mentions).length > 0 && args.length >= 2) {
      recipientID = Object.keys(event.mentions)[0];
      amount = parseInt(args[args.length - 1]);
    }
    // Case 3: UID + amount
    else if (args.length >= 2 && /^\d{5,}$/.test(args[0]) && !isNaN(args[1])) {
      recipientID = args[0];
      amount = parseInt(args[1]);
    }

    // Invalid usage
    if (!recipientID || isNaN(amount)) {
      return message.reply(
        "⚠️ Usage:\n" +
        `- ${prefix}send -m @user <amount>\n` +
        `- ${prefix}send -m <UID> <amount>\n` +
        `- ${prefix}send -m <amount> (as a reply)`
      );
    }

    if (amount <= 0) return message.reply("⚠️ Amount must be greater than 0.");
    if (recipientID === senderID) return message.reply("❌ You can’t send money to yourself.");

    const senderData = await usersData.get(senderID);
    const recipientData = await usersData.get(recipientID);
    const senderBalance = senderData.money || 0;

    if (senderBalance < amount) {
      return message.reply(`❌ You don’t have enough balance. Your balance: $${senderBalance}`);
    }

    // Transfer money
    await usersData.set(senderID, { money: senderBalance - amount });
    await usersData.set(recipientID, { money: (recipientData.money || 0) + amount });

    const recipientName = recipientData.name || "User";

    // Bold converter
    function toBoldUnicode(text) {
      const boldAlphabet = {
        "a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣",
        "k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭",
        "u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳",
        "A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉",
        "K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓",
        "U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙",
        "0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",
        " ":" ","'":"'",",":",",".":".","-":"-","!":"!","?":"?"
      };
      return text.split('').map(c => boldAlphabet[c] || c).join('');
    }

    const styledAmount = toBoldUnicode(amount.toString());
    const styledName = toBoldUnicode(recipientName);

    return message.reply(
      `✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐬𝐞𝐧𝐭 𝐦𝐨𝐧𝐞𝐲 ${styledAmount} 𝐭𝐨 ${styledName}.`,
      [],
      {
        mentions: [{
          tag: `@${recipientName}`,
          id: recipientID
        }]
      }
    );
  }
};
