module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "2.3",
    author: "Arijit",
    countDown: 5,
    role: 0,
    description: {
      vi: "xem số tiền hiện có của bạn hoặc người được tag",
      en: "view your money or the money of the tagged person"
    },
    category: "group",
    guide: {
      vi: "   {pn}: xem số tiền của bạn\n   {pn} <@tag>: xem số tiền của người được tag\n   Reply {pn}: xem số tiền của người được reply",
      en: "   {pn}: view your money\n   {pn} <@tag>: view the money of the tagged person\n   Reply {pn}: view the money of the replied user"
    }
  },

  onStart: async function ({ message, usersData, event }) {
    // ✅ Bold Unicode Converter
    function toBoldUnicode(text) {
      const boldAlphabet = {
        "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
        "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
        "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳",
        "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃", "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉",
        "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍", "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓",
        "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗", "Y": "𝐘", "Z": "𝐙",
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗",
        " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
      };
      return text.split('').map(char => boldAlphabet[char] || char).join('');
    }

    // ✅ Format money with suffix
    function formatAmount(num) {
      num = Number(num) || 0;
      const suffixes = ["", "K", "M", "B", "T", "Q", "QU", "S"];
      const tier = Math.floor(Math.log10(Math.abs(num || 1)) / 3);
      if (tier === 0) return toBoldUnicode(num.toString()) + "＄";
      const suffix = suffixes[tier] || "";
      const scale = Math.pow(10, tier * 3);
      const scaled = num / scale;
      return toBoldUnicode(scaled.toFixed(1).replace(/\.0$/, '')) + toBoldUnicode(suffix) + "＄";
    }

    const mentionIDs = Object.keys(event.mentions);

    // ✅ Check mentioned users
    if (mentionIDs.length > 0) {
      let reply = "";
      for (const uid of mentionIDs) {
        const name = event.mentions[uid].replace("@", "");
        const styledName = toBoldUnicode(name);
        const balance = await usersData.get(uid, "money") || 0;
        reply += ` ${styledName}, 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬: ${formatAmount(balance)}\n`;
      }
      return message.reply(reply.trim());
    }

    // ✅ Check replied user
    if (event.type === "message_reply" && event.messageReply?.senderID) {
      const uid = event.messageReply.senderID;
      const name = await usersData.getName(uid);
      const styledName = toBoldUnicode(name);
      const balance = await usersData.get(uid, "money") || 0;
      return message.reply(` ${styledName}, 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬: ${formatAmount(balance)}`);
    }

    // ✅ Default self balance
    const selfData = await usersData.get(event.senderID);
    const selfBalance = selfData?.money || 0;
    return message.reply(`${toBoldUnicode("Baby, Your balance:")} ${formatAmount(selfBalance)}`);
  }
};
