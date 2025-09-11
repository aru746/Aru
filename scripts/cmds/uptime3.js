const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "uptime3",
    aliases: ["upt3", "up3"],
    version: "2.4",
    author: "Raihan Fiba + upgraded by Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Cute uptime with glowing visuals",
    longDescription: "Show uptime, CPU, RAM with glowing blue visuals at bottom",
    category: "general",
    guide: { en: "uptime" }
  },

  onStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const timeNow = moment.tz("Asia/Dhaka");
    const session = getTimeSession(timeNow.hour());

    // Uptime
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimePercent = Math.min((uptimeHours / 24) * 100, 100);

    // Group Info
    const gcInfo = await api.getThreadInfo(event.threadID);
    const gcName = gcInfo.threadName || "Group Chat";
    const botName = "Alya Chan🍓";
    const senderName =
      (await api.getUserInfo(event.senderID))[event.senderID]?.name || "User";

    // Memory Info
    const totalMem = os.totalmem() / 1024 / 1024 / 1024;
    const freeMem = os.freemem() / 1024 / 1024 / 1024;
    const usedMem = totalMem - freeMem;

    // CPU Load
    const cpuLoad = Math.min((os.loadavg()[0] / os.cpus().length) * 100, 100);

    // Background (keep original size)
    const bg = await loadImage("https://files.catbox.moe/11x2w8.jpg");
    const canvas = createCanvas(bg.width, bg.height); 
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    // Group Avatar
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${event.threadID}/picture?height=720&width=720&redirect=true`,
        { responseType: "arraybuffer" }
      );
      const avatarPath = path.join(cacheDir, `gcAvatar-${event.threadID}.png`);
      fs.writeFileSync(avatarPath, response.data);
      const gcAvatar = await loadImage(avatarPath);

      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 100, 60, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(gcAvatar, 40, 40, 120, 120);
      ctx.restore();

      fs.unlinkSync(avatarPath);
    } catch (e) {
      console.error("❌ Group image load failed:", e.message);
    }

    // Info Text (white with blue shadow)
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00aaff";  // 🔵 blue shadow
    ctx.shadowBlur = 10;

    let y = 220, lh = 36;
    ctx.fillText(`👥 Group: ${gcName}`, 40, y); y += lh;
    ctx.fillText(`🌷 Bot: ${botName}`, 40, y); y += lh;
    ctx.fillText(`👤 User: ${senderName}`, 40, y); y += lh;
    ctx.fillText(`🕓 Time: ${timeNow.format("hh:mm A")} (${session})`, 40, y); y += lh;
    ctx.fillText(`📅 Date: ${timeNow.format("DD MMM YYYY")}`, 40, y); y += lh;

    ctx.shadowBlur = 0; // disable shadow for other elements

    // Glowing Circles (smaller, centered bottom)
    const baseY = bg.height - 120; 
    const radius = 40; // smaller size
    drawGlowingCircle(ctx, bg.width / 2 - 120, baseY, radius, uptimePercent, "Uptime", `${uptimeHours}h`);
    drawGlowingCircle(ctx, bg.width / 2, baseY, radius, cpuLoad, "CPU", `${cpuLoad.toFixed(1)}%`);
    drawGlowingCircle(ctx, bg.width / 2 + 120, baseY, radius, (usedMem / totalMem) * 100, "RAM", `${usedMem.toFixed(1)} GB`);

    // Save & Send
    const imgPath = path.join(cacheDir, `uptime-${event.senderID}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());

    return api.sendMessage(
      {
        body: `🤖 𝐁𝐨𝐭 - 𝐀𝐥𝐲𝐚 𝐂𝐡𝐚𝐧\n👑 𝐀𝐝𝐦𝐢𝐧 - 𝐀𝐫𝐢𝐣𝐢𝐭`,
        attachment: fs.createReadStream(imgPath)
      },
      event.threadID,
      () => fs.unlinkSync(imgPath),
      event.messageID
    );
  }
};

// Time session
function getTimeSession(hour) {
  if (hour >= 4 && hour < 10) return "Morning";
  if (hour >= 10 && hour < 14) return "Noon";
  if (hour >= 14 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 20) return "Evening";
  return "Night";
}

// Draw glowing circle (blue glow + white text with shadow)
function drawGlowingCircle(ctx, x, y, radius, percent, label, value) {
  const angle = (percent / 100) * Math.PI * 2;

  ctx.save();
  ctx.shadowColor = "#00aaff"; // 🔵 Blue glow
  ctx.shadowBlur = 20;

  // Background circle
  ctx.beginPath();
  ctx.strokeStyle = "#565656";
  ctx.lineWidth = 6;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Blue arc
  ctx.beginPath();
  ctx.strokeStyle = "#00aaff";
  ctx.lineWidth = 6;
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.stroke();

  ctx.restore();

  // Labels (white with blue shadow)
  ctx.font = "15px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.shadowColor = "#00aaff"; 
  ctx.shadowBlur = 8;
  ctx.fillText(label, x, y - 10);

  ctx.font = "bold 18px sans-serif";
  ctx.fillText(value, x, y + 22);

  ctx.shadowBlur = 0; // reset shadow
}
