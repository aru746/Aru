const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "vip",
    version: "4.0",
    author: "Arijit",
    countDown: 5,
    role: 2,
    shortDescription: "Manage VIP users",
    longDescription: "Add, remove, and list VIP users with expiration dates",
    category: "system",
    guide: {
      en: "{pn} add <uid> <days>\n{pn} add <uid> 0 (Permanent)\n{pn} remove <uid>\n{pn} list"
    }
  },

  onStart: async function ({ message, args, usersData }) {
    const vipDataPath = path.join(__dirname, "vipData.json");
    if (!fs.existsSync(vipDataPath)) {
      fs.writeFileSync(vipDataPath, JSON.stringify({ permission: [] }, null, 2));
    }
    const vipData = JSON.parse(fs.readFileSync(vipDataPath));

    // Unicode bold converter
    function toBoldUnicode(name) {
      const boldAlphabet = {
        "a": "𝐚","b": "𝐛","c": "𝐜","d": "𝐝","e": "𝐞","f": "𝐟","g": "𝐠","h": "𝐡","i": "𝐢","j": "𝐣",
        "k": "𝐤","l": "𝐥","m": "𝐦","n": "𝐧","o": "𝐨","p": "𝐩","q": "𝐪","r": "𝐫","s": "𝐬","t": "𝐭",
        "u": "𝐮","v": "𝐯","w": "𝐰","x": "𝐱","y": "𝐲","z": "𝐳","A": "𝐀","B": "𝐁","C": "𝐂","D": "𝐃",
        "E": "𝐄","F": "𝐅","G": "𝐆","H": "𝐇","I": "𝐈","J": "𝐉","K": "𝐊","L": "𝐋","M": "𝐌","N": "𝐍",
        "O": "𝐎","P": "𝐏","Q": "𝐐","R": "𝐑","S": "𝐒","T": "𝐓","U": "𝐔","V": "𝐕","W": "𝐖","X": "𝐗",
        "Y": "𝐘","Z": "𝐙","0": "0","1": "1","2": "2","3": "3","4": "4","5": "5","6": "6","7": "7","8": "8",
        "9": "9"," ": " ","'": "'",",": ",",".": ".","-": "-","!": "!","?": "?"
      };
      return name.split("").map(char => boldAlphabet[char] || char).join("");
    }

    // --- ADD VIP ---
    if (args[0] === "add") {
      const uid = args[1];
      if (!uid) return message.reply("❌ | Please provide a UID.");

      let days = parseInt(args[2]);
      let expireDate = null;
      if (!isNaN(days)) {
        if (days > 0) {
          expireDate = Date.now() + days * 24 * 60 * 60 * 1000;
        } else if (days === 0) {
          expireDate = null; // Permanent
        }
      }

      if (!vipData.permission.includes(uid)) {
        vipData.permission.push(uid);
      }

      await usersData.set(uid, { vipExpire: expireDate }, { merge: true });
      fs.writeFileSync(vipDataPath, JSON.stringify(vipData, null, 2));

      const user = await usersData.get(uid);
      const name = toBoldUnicode(user.name || uid);
      const expStr = expireDate ? new Date(expireDate).toLocaleDateString("en-GB") : "Permanent";

      return message.reply(`✅ | Added ${name} as VIP\n   └ 𝐄𝐱𝐩𝐢𝐫𝐞𝐬: ${expStr}`);
    }

    // --- REMOVE VIP ---
    else if (args[0] === "remove") {
      const uid = args[1];
      if (!uid) return message.reply("❌ | Please provide a UID.");

      vipData.permission = vipData.permission.filter(id => id !== uid);
      await usersData.set(uid, { vipExpire: null }, { merge: true });
      fs.writeFileSync(vipDataPath, JSON.stringify(vipData, null, 2));

      return message.reply(`🗑️ | Removed UID ${uid} from VIP list.`);
    }

    // --- LIST VIPs ---
    else if (args[0] === "list") {
      if (!vipData.permission.length) return message.reply("👑 | No VIP users yet.");

      // Auto-remove expired
      const now = Date.now();
      vipData.permission = vipData.permission.filter(id => {
        const user = usersData.get(id);
        return !(user && user.vipExpire && user.vipExpire < now);
      });
      fs.writeFileSync(vipDataPath, JSON.stringify(vipData, null, 2));

      const vipList = await Promise.all(vipData.permission.map(async id => {
        const user = await usersData.get(id);
        const name = toBoldUnicode(user.name || id);
        const expireDate = user.vipExpire ? new Date(user.vipExpire).toLocaleDateString("en-GB") : "Permanent";
        return `• ${name}\n   └ 𝐄𝐱𝐩𝐢𝐫𝐞𝐬: ${expireDate}`;
      }));

      return message.reply(`👑 | 𝐕𝐈𝐏 𝐔𝐬𝐞𝐫𝐬 (${vipList.length})\n\n${vipList.join("\n\n")}`);
    }

    // --- HELP ---
    else {
      return message.reply(
        "⚙️ | Usage:\n" +
        "- vip add <uid> <days>\n" +
        "- vip add <uid> 0 (Permanent)\n" +
        "- vip remove <uid>\n" +
        "- vip list"
      );
    }
  }
};
