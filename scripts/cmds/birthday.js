const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

// ===== MongoDB Schema =====
const birthdaySchema = new mongoose.Schema({
  userID: String,
  name: String,
  date: String,
  zodiac: String
});
const Birthday = mongoose.models.Birthday || mongoose.model("Birthday", birthdaySchema);

// ===== Unicode Bold Converter =====
function toBoldUnicode(name) {
  const boldAlphabet = {
    "a": "𝐚","b": "𝐛","c": "𝐜","d": "𝐝","e": "𝐞","f": "𝐟","g": "𝐠","h": "𝐡","i": "𝐢","j": "𝐣",
    "k": "𝐤","l": "𝐥","m": "𝐦","n": "𝐧","o": "𝐨","p": "𝐩","q": "𝐪","r": "𝐫","s": "𝐬","t": "𝐭",
    "u": "𝐮","v": "𝐯","w": "𝐰","x": "𝐱","y": "𝐲","z": "𝐳","A": "𝐀","B": "𝐁","C": "𝐂","D": "𝐃",
    "E": "𝐄","F": "𝐅","G": "𝐆","H": "𝐇","I": "𝐈","J": "𝐉","K": "𝐊","L": "𝐋","M": "𝐌","N": "𝐍",
    "O": "𝐎","P": "𝐏","Q": "𝐐","R": "𝐑","S": "𝐒","T": "𝐓","U": "𝐔","V": "𝐕","W": "𝐖","X": "𝐗",
    "Y": "𝐘","Z": "𝐙","0": "0","1": "1","2": "2","3": "3","4": "4","5": "5","6": "6","7": "7","8": "8",
    "9": "9"," ": " ","'": "'",
    ",": ",",".": ".","-": "-","!": "!","?": "?"
  };
  return name.split("").map(c => boldAlphabet[c] || c).join("");
}

// ===== Zodiac Helper =====
function getZodiac(day, month) {
  const zodiacs = [
    ["Capricorn", "♑"], ["Aquarius", "♒"], ["Pisces", "♓"], ["Aries", "♈"], ["Taurus", "♉"], ["Gemini", "♊"],
    ["Cancer", "♋"], ["Leo", "♌"], ["Virgo", "♍"], ["Libra", "♎"], ["Scorpio", "♏"], ["Sagittarius", "♐"], ["Capricorn", "♑"]
  ];
  const lastDay = [20, 19, 20, 20, 21, 21, 22, 22, 22, 23, 22, 21];
  return month === 1 && day <= 19 ? "♑" :
    (day > lastDay[month - 1] ? zodiacs[month][1] : zodiacs[month - 1][1]);
}

// ===== Fallback File =====
const fallbackFile = path.join(__dirname, "birthdays.json");
if (!fs.existsSync(fallbackFile)) fs.writeJSONSync(fallbackFile, []);

// ===== Helper: Get All Birthdays =====
async function getBirthdays() {
  try {
    return await Birthday.find();
  } catch {
    return fs.readJSONSync(fallbackFile, []);
  }
}

// ===== Helper: Save Birthdays (Fallback) =====
function saveBirthdays(data) {
  fs.writeJSONSync(fallbackFile, data, { spaces: 2 });
}

module.exports = {
  config: {
    name: "birthday",
    version: "3.1",
    author: "Nafiz + kuze",
    countDown: 5,
    role: 0,
    shortDescription: "Manage birthdays",
    longDescription: "Birthday manager with add, list, countdown, horoscope & reminders",
    category: "utility",
    guide: {
      en: "{p}birthday add <DD-MM-YYYY> <name>\n{p}birthday list\n{p}birthday next\n{p}birthday countdown\n{p}birthday remove <name>\n{p}birthday edit <name> <new-date>"
    }
  },

  onStart: async function ({ args, message, event }) {
    const sub = args[0];
    if (!sub) return message.reply("🎂 Use: add/list/remove/edit/next/countdown");

    // ===== ADD =====
    if (sub === "add") {
      const [date, ...rest] = args.slice(1);
      const name = rest.join(" ");
      if (!date || !name) return message.reply("⚠️ Format: birthday add <DD-MM-YYYY> <name>");

      const [day, month] = date.split("-").map(n => parseInt(n));
      const zodiac = getZodiac(day, month);

      try {
        await Birthday.create({ userID: event.senderID, name, date, zodiac });
      } catch {
        let data = await getBirthdays();
        data.push({ userID: event.senderID, name, date, zodiac });
        saveBirthdays(data);
      }

      return message.reply(`✅ Added **${name}** 🎂 on ${date} ${zodiac}`);
    }

    // ===== LIST (Premium Image Card) =====
    if (sub === "list") {
      const birthdays = await getBirthdays();
      if (birthdays.length === 0) return message.reply("📭 | No birthdays saved yet.");

      const width = 950;
      const height = 180 + birthdays.length * 100;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Premium Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#ffecd2"); // peach
      gradient.addColorStop(1, "#fcb69f"); // coral
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.fillStyle = "#2c2c54";
      ctx.font = "bold 42px Sans";
      ctx.fillText("🎂| 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆 𝗟𝗶𝘀𝘁 :", 60, 80);

      let y = 150;
      for (let i = 0; i < birthdays.length; i++) {
        const b = birthdays[i];
        const boldName = toBoldUnicode(b.name);

        // Premium Name (black + gold glow)
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 6;
        ctx.fillStyle = "#000";
        ctx.font = "30px Sans";
        ctx.fillText(`│╭‣ ${i + 1}. ${boldName}`, 80, y);
        ctx.shadowBlur = 0;
        y += 45;

        // Date (blue) + Zodiac (gold)
        ctx.fillStyle = "#1e3799";
        ctx.font = "24px Sans";
        ctx.fillText(`│╰‣ 🎂 [ ${b.date} ]`, 80, y);

        ctx.fillStyle = "#FFD700";
        ctx.font = "26px Sans";
        ctx.fillText(`${b.zodiac}`, 360, y);

        y += 60;
      }

      // Footer line
      ctx.fillStyle = "#2c2c54";
      ctx.font = "bold 28px Monospace";
      ctx.fillText("", 80, y);

      // Save & send
      const imgPath = path.join(__dirname, "birthday_list_card.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      return message.reply({
        body: `🎀 | Birthday Directory (${birthdays.length} total)`,
        attachment: fs.createReadStream(imgPath)
      });
    }

    // ===== REMOVE =====
    if (sub === "remove") {
      const name = args.slice(1).join(" ");
      if (!name) return message.reply("⚠️ Provide name to remove.");

      try {
        await Birthday.deleteOne({ name });
      } catch {
        let data = await getBirthdays();
        data = data.filter(b => b.name !== name);
        saveBirthdays(data);
      }

      return message.reply(`🗑 Removed **${name}**`);
    }

    // ===== NEXT =====
    if (sub === "next") {
      const birthdays = await getBirthdays();
      if (birthdays.length === 0) return message.reply("📭 | No birthdays saved yet.");

      const today = moment().tz("Asia/Dhaka");
      const sorted = birthdays.map(b => {
        const [d, m] = b.date.split("-").map(Number);
        let next = moment(`${today.year()}-${m}-${d}`, "YYYY-M-D");
        if (next.isBefore(today)) next.add(1, "year");
        return { ...b, next };
      }).sort((a, b) => a.next - b.next);

      const nxt = sorted[0];
      return message.reply(`🎉 Next birthday: **${nxt.name}** on ${nxt.date} ${nxt.zodiac}`);
    }

    // ===== COUNTDOWN =====
    if (sub === "countdown") {
      const birthdays = await getBirthdays();
      if (birthdays.length === 0) return message.reply("📭 | No birthdays saved yet.");

      const today = moment().tz("Asia/Dhaka");
      let reply = "⏳ Birthday Countdown:\n";
      birthdays.forEach(b => {
        const [d, m] = b.date.split("-").map(Number);
        let next = moment(`${today.year()}-${m}-${d}`, "YYYY-M-D");
        if (next.isBefore(today)) next.add(1, "year");
        const days = next.diff(today, "days");
        reply += `• ${b.name} → ${days} days left 🎂\n`;
      });

      return message.reply(reply);
    }

    // ===== EDIT =====
    if (sub === "edit") {
      const name = args[1];
      const newDate = args[2];
      if (!name || !newDate) return message.reply("⚠️ Format: birthday edit <name> <DD-MM-YYYY>");

      const [day, month] = newDate.split("-").map(n => parseInt(n));
      const zodiac = getZodiac(day, month);

      try {
        await Birthday.findOneAndUpdate({ name }, { date: newDate, zodiac });
      } catch {
        let data = await getBirthdays();
        data = data.map(b => b.name === name ? { ...b, date: newDate, zodiac } : b);
        saveBirthdays(data);
      }

      return message.reply(`✏ Updated ${name}'s birthday → ${newDate} ${zodiac}`);
    }
  }
};
