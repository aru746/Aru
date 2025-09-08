const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "uptime3",
    aliases: ["upt3","up3"],
    version: "2.0",
    author: "Raihan Fiba + upgraded by Arijjit",
    countDown: 5,
    role: 0,
    shortDescription: "Cute uptime with red glowing circles",
    longDescription: "Show uptime, CPU, RAM with glowing red visuals at bottom",
    category: "general",
    guide: { en: "uptime" }
  },

  onStart: async function ({ api, event }) {
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
    const senderName = (await api.getUserInfo(event.senderID))[event.senderID]?.name || "User";

    // Memory Info
    const totalMem = os.totalmem() / 1024 / 1024 / 1024;
    const freeMem = os.freemem() / 1024 / 1024 / 1024;
    const usedMem = totalMem - freeMem;

    // Approx CPU Load (percentage based on cores)
    const cpuLoad = Math.min((os.loadavg()[0] / os.cpus().length) * 100, 100);

    // Background Image
    const bg = await loadImage("https://files.catbox.moe/11x2w8.jpg");
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Group Avatar
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${event.threadID}/picture?height=720&width=720&redirect=true`,
        { responseType: "arraybuffer" }
      );
      const avatarPath = path.join(__dirname, "cache", `gcAvatar-${event.threadID}.png`);
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

    // Text
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#ffffff";
    let y = 200, lh = 36;
    ctx.fillText(`👥 Group: ${gcName}`, 40, y); y += lh;
    ctx.fillText(`🌷 Bot: ${botName}`, 40, y); y += lh;
    ctx.fillText(`👤 User: ${senderName}`, 40, y); y += lh;
    ctx.fillText(`🕓 Time: ${timeNow.format("hh:mm A")} (${session})`, 40, y); y += lh;
    ctx.fillText(`📅 Date: ${timeNow.format("DD MMM YYYY")}`, 40, y); y += lh;

    // Glowing Circles
    const baseY = 400;
    const radius = 40;
    drawGlowingCircle(ctx, 300, baseY, radius, uptimePercent, "Uptime", `${uptimeHours}h`);
    drawGlowingCircle(ctx, 400, baseY, radius, cpuLoad, "CPU", `${cpuLoad.toFixed(1)}%`);
    drawGlowingCircle(ctx, 500, baseY, radius, (usedMem / totalMem) * 100, "RAM", `${usedMem.toFixed(1)}G`);

    // Save & Send
    const imgPath = path.join(__dirname, "cache", `uptime-${event.senderID}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());

    return api.sendMessage({
      body: `🌷 Bot - Alya Chan🍓\n👑 Admin - Arijit`,
      attachment: fs.createReadStream(imgPath)
    }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
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

// Draw glowing circle
function drawGlowingCircle(ctx, x, y, radius, percent, label, value) {
  const angle = (percent / 100) * Math.PI * 2;

  ctx.save();
  ctx.shadowColor = "#00aaff";
  ctx.shadowBlur = 20;

  // Background circle
  ctx.beginPath();
  ctx.strokeStyle = "#565656";
  ctx.lineWidth = 6;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // blue arc
  ctx.beginPath();
  ctx.strokeStyle = "#00aaff";
  ctx.lineWidth = 6;
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.stroke();

  ctx.restore();

  // Label & value
  ctx.font = "15px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y - 10);
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(value, x, y + 20);
}
