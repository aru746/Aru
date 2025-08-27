module.exports = {
  config: {
    name: "top",
    version: "1.5",
    author: "Arijit",
    role: 0,
    shortDescription: {
      en: "Top 15 Rich Users"
    },
    longDescription: {
      en: ""
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, usersData }) {
    try {
      // Unicode bold converter
      function toBoldUnicode(name) {
        const boldAlphabet = {
          "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
          "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
          "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
          "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
          "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
          "Y": "𝐘", "Z": "𝐙", "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8",
          "9": "9", " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
        };
        return name.split('').map(char => boldAlphabet[char] || char).join('');
      }

      // Get all users from database
      const allUsers = await usersData.getAll();

      if (!allUsers || allUsers.length === 0) {
        return message.reply("No user data found.");
      }

      // Sort users by money and take top 15
      const topUsers = allUsers
        .sort((a, b) => (b.money || 0) - (a.money || 0))
        .slice(0, 15);

      // Function to format numbers
      function formatNumber(num) {
        if (num >= 1e15) return (num / 1e15).toFixed(2) + "Q";
        if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
        if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
        return num.toString();
      }

      const medals = ["🥇", "🥈", "🥉"];

      // Create leaderboard
      const topUsersList = topUsers.map((user, index) => {
        const moneyFormatted = formatNumber(user.money || 0);
        const rankSymbol = medals[index] || `${index + 1}.`;
        const boldName = toBoldUnicode(user.name || "Unknown");
        return `${rankSymbol} ${boldName} - ${moneyFormatted}`;
      });

      // Build final message
      const messageText =
        `👑 𝗧𝗢𝗣 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 👑\n` +
        `━━━━━━━━━━━\n` +
        topUsersList.join("\n");

      message.reply(messageText);

    } catch (error) {
      console.error(error);
      message.reply("An error occurred while fetching the top users.");
    }
  }
};
