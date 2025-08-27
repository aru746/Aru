module.exports = {
  config: {
    name: "owner",
    version: "1.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "bot owner info (noprefix)",
    longDescription: "Shows bot owner info without needing prefix",
    category: "auto"
  },

  onStart: async function () {},

  onChat: async function ({ event, message, usersData, threadsData }) {
    if (!event.body) return;
    const body = event.body.toLowerCase();

    // Trigger words
    const triggers = ["owner", "bot owner", "who is owner", "alya owner"];
    if (!triggers.includes(body)) return;

    const userData = await usersData.get(event.senderID);
    const threadData = await threadsData.get(event.threadID);
    const threadName = threadData.threadName;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Dhaka",
      hour12: true
    });

    const infoMessage = `👤 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑
━━━━━━━━━━━━━━━
╭➢ 𝐍𝐚𝐦𝐞 : 𝐀 𝐑 𝐈 𝐉 𝐈 𝐓 👑
│➢ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 : 𝐀𝐫𝐮
│➢ 𝐀𝐝𝐝𝐫𝐞𝐬𝐬 : 𝐊𝐨𝐥𝐤𝐚𝐭𝐚 🇮🇳
│➢ 𝐆𝐞𝐧𝐝𝐞𝐫 : 𝐌𝐚𝐥𝐞 
│➢ 𝐀𝐠𝐞 : 𝟐𝟎
│➢ 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 : 𝟐𝟏/𝟎𝟓/𝟐𝟎𝟎𝟓
│➢ 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : 𝐍𝐞𝐟𝐚𝐫𝐢𝐨𝐮𝐬 𝐀𝐫𝐢𝐣𝐢𝐭 𝐈𝐈
╰➢ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 : 𝐢𝐭𝐳_𝐚𝐫𝐢𝐣𝐢𝐭_𝟕𝟕𝟕   

╭➢ 𝐁𝐎𝐓 : 𝐀𝐥𝐲𝐚 𝐂𝐡𝐚𝐧 🐱🎀
│➢ 𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞: ${threadName}
╰➢ 🕒 ${dateStr} | ${timeStr}
━━━━━━━━━━━━━━━`;

    return message.reply({
      body: infoMessage,
      attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/klc7er.mp4")
    });
  }
};
