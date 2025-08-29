const os = require("os");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

// Unicode gradient frames for title animation
const gradientFrames = [
  "🄰🄻🅈🄰 🄲🄷🄰🄽",
  "🅐🅛🅨🅐 🅒🅗🅐🅝",
  "ＡＬＹＡ ＣＨＡＮ",
  "𝐀𝐋𝐘𝐀 𝐂𝐇𝐀𝐍",
  "🄰🄻🅈🄰 🄲🄷🄰🄽"
];

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["upt2", "up2"],
    version: "1.7",
    author: "Arijit (fixed & tested 100%)",
    role: 0,
    category: "𝗦𝗬𝗦𝗧𝗘𝗠",
    guide: { en: "Use {pn}" }
  },

  onStart: async function ({ message, api }) {
    try {
      // ----- System Info -----
      const uptime = process.uptime();
      const formattedUptime = formatMilliseconds(uptime * 1000);

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      const diskUsage = await getDiskUsage();

      const systemInfo = {
        os: `${os.type()} ${os.release()}`,
        arch: os.arch(),
        cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
        loadAvg: os.loadavg()[0].toFixed(2),
        botUptime: formattedUptime,
        systemUptime: formatUptime(os.uptime()),
        processMemory: prettyBytes(process.memoryUsage().rss)
      };

      // ----- Gradient Title -----
      const gradientTitle = gradientFrames[Math.floor(Math.random() * gradientFrames.length)];

      // ----- Message Content -----
      const response =
`╔════════•❀•════════╗
⋆˚🦋${gradientTitle}🎀🍓˚⋆
╚════════•❀•════════╝

🌸 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢
────────────────────
✨ 𝗢𝗦: ${systemInfo.os}
✨ 𝗔𝗥𝗖𝗛: ${systemInfo.arch}
✨ 𝗖𝗣𝗨: ${systemInfo.cpu}
✨ 𝗟𝗢𝗔𝗗 𝗔𝗩𝗚: ${systemInfo.loadAvg}
────────────────────
💾 𝗠𝗘𝗠𝗢𝗥𝗬
✨ Usage: ${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)}
✨ RAM: ${prettyBytes(totalMemory - freeMemory)} / ${prettyBytes(totalMemory)}
────────────────────
📀 𝗗𝗜𝗦𝗞 𝗦𝗣𝗔𝗖𝗘
✨ Usage: ${prettyBytes(diskUsage.used)} / ${prettyBytes(diskUsage.total)}
────────────────────
🤖 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘: ${systemInfo.botUptime}
⚙ 𝗦𝗘𝗥𝗩𝗘𝗥 𝗨𝗣𝗧𝗜𝗠𝗘: ${systemInfo.systemUptime}
📊 𝗣𝗥𝗢𝗖𝗘𝗦𝗦 𝗠𝗘𝗠𝗢𝗥𝗬: ${systemInfo.processMemory}
────────────────────`;

      // ----- Send Message -----
      const sentMessage = await message.reply(response);

      // ----- Auto Unsend after 15 seconds -----
      setTimeout(async () => {
        try {
          await api.unsendMessage(sentMessage.messageID);
        } catch (err) {
          console.error("Auto-unsend failed:", err);
        }
      }, 15000);

    } catch (err) {
      console.error("uptime2 Error:", err);
      message.reply("❌ Error while fetching uptime/system info.");
    }
  }
};

// ---------- Helpers ----------
async function getDiskUsage() {
  try {
    const { stdout } = await exec("df -k /");
    const parts = stdout.split("\n")[1].split(/\s+/).filter(Boolean);
    const total = parseInt(parts[1]) * 1024;
    const used = parseInt(parts[2]) * 1024;
    return { total, used };
  } catch (error) {
    console.error("Error fetching disk usage:", error);
    return { total: 0, used: 0 };
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatMilliseconds(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

function prettyBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}
