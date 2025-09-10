const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.5",
    author: "NTKhang & Customized by Mahabub",
    category: "events"
  },

  langs: {
    en: {
      defaultWelcomeMessage: `𝐇𝐞𝐥𝐥𝐨 {userName}
𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 {boxName}
𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 {memberCount} 𝐦𝐞𝐦𝐛𝐞𝐫 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐣𝐨𝐲 🎉
━━━━━━━━━━━━━━━━
📅 {time}`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const dataAddedParticipants = event.logMessageData.addedParticipants || [];

    // 🔴 Removed self-welcome system here

    if (!global.temp.welcomeEvent[threadID]) {
      global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
    }

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
      try {
        const threadData = await threadsData.get(threadID);
        if (!threadData || threadData?.settings?.sendWelcomeMessage === false) return;

        const dataAdded = global.temp.welcomeEvent[threadID].dataAddedParticipants;
        if (!dataAdded || dataAdded.length === 0) return;

        const threadName = threadData.threadName || "this group";
        const names = dataAdded.map(u => u.fullName).join(", ");

        // Build formatted time string
        const timeStr = new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
          hour12: true
        });

        // ✅ Fix member counting
        const memberCount = threadData.participantIDs ? threadData.participantIDs.length : 0;

        // Replace placeholders
        let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data || {};
        welcomeMessage = welcomeMessage
          .replace(/\{userName\}/g, names)
          .replace(/\{boxName\}/g, threadName)
          .replace(/\{memberCount\}/g, memberCount)
          .replace(/\{time\}/g, timeStr);

        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);

        const avatarSize = 240;
        const W = 983, H = 480;
        const FONT_NAME = "ModernNoirBold";
        const FONT_URL = "https://github.com/Saim12678/Saim/blob/693ceed2f392ac4fe6f98f77b22344f6fc5ac9f8/fonts/tt-modernoir-trial.bold.ttf?raw=true";
        const fontPath = path.join(tmp, `${FONT_NAME}.ttf`);

        try {
          if (!fs.existsSync(fontPath)) {
            const fontRes = await axios.get(FONT_URL, { responseType: "arraybuffer" });
            fs.writeFileSync(fontPath, fontRes.data);
          }
          registerFont(fontPath, { family: FONT_NAME });
        } catch {
          console.warn("⚠️ Font load failed, fallback to sans-serif.");
        }

        const backgrounds = [
          "https://files.catbox.moe/cj68oa.jpg",
          "https://files.catbox.moe/0n8mmb.jpg",
          "https://files.catbox.moe/hvynlb.jpg",
          "https://files.catbox.moe/leyeuq.jpg",
          "https://files.catbox.moe/7ufcfb.jpg",
          "https://files.catbox.moe/y78bmv.jpg"
        ];

        // Create welcome card per new member
        for (const user of dataAdded) {
          const form = {
            body: welcomeMessage,
            mentions: [{ tag: user.fullName, id: user.userFbId }]
          };

          try {
            const avatarPath = path.join(tmp, `avt_${user.userFbId}.png`);
            const bgPath = path.join(tmp, "bg.jpg");
            const outputPath = path.join(tmp, `welcome_${user.userFbId}.png`);

            // Avatar
            const avatarRes = await axios.get(
              `https://graph.facebook.com/${user.userFbId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
              { responseType: "arraybuffer" }
            );
            fs.writeFileSync(avatarPath, avatarRes.data);

            // Background
            const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(bgPath, bgRes.data);

            const avatar = await loadImage(avatarPath);
            const bg = await loadImage(bgPath);

            const canvas = createCanvas(W, H);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(bg, 0, 0, W, H);

            // Circular avatar
            const ax = (W - avatarSize) / 2;
            const ay = 30;
            ctx.beginPath();
            ctx.arc(W / 2, ay + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            ctx.arc(W / 2, ay + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, ax, ay, avatarSize, avatarSize);
            ctx.restore();

            // Draw 3D text
            function draw3DText(ctx, text, x, y, fontSize) {
              ctx.font = `${fontSize}px ${FONT_NAME}, sans-serif`;
              ctx.textAlign = "center";
              const offsets = [[4, 4], [3, 3], [2, 2], [1, 1]];
              ctx.fillStyle = "#000";
              for (let [dx, dy] of offsets) ctx.fillText(text, x + dx, y + dy);
              ctx.fillStyle = "#fff";
              ctx.fillText(text, x, y);
            }

            draw3DText(ctx, user.fullName, W / 2, 345, 64);
            draw3DText(ctx, threadName, W / 2, 400, 42);
            draw3DText(ctx, `You're the ${memberCount} member`, W / 2, 447, 38);

            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(outputPath, buffer);

            form.attachment = fs.createReadStream(outputPath);
            await message.send(form);

            // Cleanup
            fs.unlinkSync(avatarPath);
            fs.unlinkSync(bgPath);
            fs.unlinkSync(outputPath);
          } catch (err) {
            console.error("❌ Error creating welcome image:", err);
            await message.send(form);
          }
        }
      } catch (err) {
        console.error("❌ Welcome event error:", err);
      }

      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
