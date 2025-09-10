const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.1",
    author: "NTKhang & Customized by Mahabub + ChatGPT Fix",
    category: "events"
  },

  langs: {
    en: {
      session1: "𝗺𝗼𝗿𝗻𝗶𝗻𝗴",
      session2: "𝗻𝗼𝗼𝗻",
      session3: "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻",
      session4: "𝗲𝘃𝗲𝗻𝗶𝗻𝗴",
      defaultWelcomeMessage: `𝙰𝚂𝚂𝙰𝙻𝙰𝙼𝚄𝚆𝙰𝙻𝙰𝙸𝙺𝚄𝙼 {userName}  𝚆𝙴𝙻𝙻𝙲𝙾𝙼𝙴  
𝚆𝙴𝙻𝙻𝙲𝙾𝙼𝙴 {multiple} 𝚃𝙾 𝚃𝙷𝙴 𝙲𝙷𝙰𝚃 𝙱𝙾𝚇: {boxName}  
𝙷𝙰𝚅𝙴 𝙰 𝙽𝙸𝙲𝙴 {session} 🐼♲`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const hours = getTime("HH");
    const { threadID } = event;
    const { nickNameBot } = global.GoatBot.config;
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    // If bot is added
    if (dataAddedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
      if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
      return message.send(getLang("defaultWelcomeMessage"));
    }

    if (!global.temp.welcomeEvent[threadID]) {
      global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
    }

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
      try {
        const threadData = await threadsData.get(threadID);
        if (threadData?.settings?.sendWelcomeMessage === false) return;

        const dataAdded = global.temp.welcomeEvent[threadID].dataAddedParticipants;
        const threadName = threadData.threadName || "this chat";
        const userName = [], mentions = [];
        const multiple = dataAdded.length > 1;

        for (const user of dataAdded) {
          userName.push(user.fullName);
          mentions.push({ tag: user.fullName, id: user.userFbId });
        }

        if (userName.length === 0) return;

        // Build welcome message
        let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data || {};
        welcomeMessage = welcomeMessage
          .replace(/\{userName\}/g, userName.join(", "))
          .replace(/\{boxName\}/g, threadName)
          .replace(/\{multiple\}/g, multiple ? "you guys" : "you")
          .replace(/\{session\}/g,
            hours <= 10 ? getLang("session1") :
              hours <= 12 ? getLang("session2") :
                hours <= 18 ? getLang("session3") :
                  getLang("session4")
          );

        const form = { body: welcomeMessage, mentions };

        // ==== Canvas Welcome Card ====
        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);

        const avatarSize = 240;
        const W = 983, H = 480;
        const FONT_NAME = "ModernNoirBold";
        const FONT_URL = "https://github.com/Saim12678/Saim/blob/693ceed2f392ac4fe6f98f77b22344f6fc5ac9f8/fonts/tt-modernoir-trial.bold.ttf?raw=true";
        const fontPath = path.join(tmp, `${FONT_NAME}.ttf`);

        if (!fs.existsSync(fontPath)) {
          const fontRes = await axios.get(FONT_URL, { responseType: "arraybuffer" });
          fs.writeFileSync(fontPath, fontRes.data);
        }
        registerFont(fontPath, { family: FONT_NAME });

        const backgrounds = [
          "https://files.catbox.moe/cj68oa.jpg",
          "https://files.catbox.moe/0n8mmb.jpg",
          "https://files.catbox.moe/hvynlb.jpg",
          "https://files.catbox.moe/leyeuq.jpg",
          "https://files.catbox.moe/7ufcfb.jpg",
          "https://files.catbox.moe/y78bmv.jpg"
        ];

        for (const user of dataAdded) {
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
              ctx.font = `${fontSize}px ${FONT_NAME}`;
              ctx.textAlign = "center";
              const offsets = [[4, 4], [3.5, 3.5], [3, 3], [2.5, 2.5], [2, 2], [1.5, 1.5], [1, 1]];
              ctx.fillStyle = "#000000";
              for (let [dx, dy] of offsets) ctx.fillText(text, x + dx, y + dy);
              ctx.fillStyle = "#ffffff";
              ctx.fillText(text, x, y);
            }

            draw3DText(ctx, user.fullName, W / 2, 345, 64);
            draw3DText(ctx, threadName, W / 2, 400, 42);
            draw3DText(ctx, `You're the ${threadData.participantIDs?.length || 0} member`, W / 2, 447, 38);

            // Time
            const timeStr = new Date().toLocaleString("en-BD", {
              timeZone: "Asia/Dhaka",
              hour: "2-digit", minute: "2-digit", second: "2-digit",
              weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
              hour12: true
            });

            form.body += `\n━━━━━━━━━━━━━━━━\n📅 ${timeStr}`;

            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(outputPath, buffer);

            form.attachment = fs.createReadStream(outputPath);
            await message.send(form);

            // Cleanup
            fs.unlinkSync(avatarPath);
            fs.unlinkSync(bgPath);
            fs.unlinkSync(outputPath);
          } catch (err) {
            console.error("Error creating welcome image:", err);
            await message.send(form);
          }
        }
      } catch (err) {
        console.error("Welcome event error:", err);
      }

      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
