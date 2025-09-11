const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// 🔹 Preload font once
(async () => {
  try {
    const fontPath = path.join(__dirname, "cache", "tt-modernoir-trial.bold.ttf");
    if (!fs.existsSync(fontPath)) {
      console.log("⏬ Downloading welcome font...");
      const fontUrl = "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";
      const { data } = await axios.get(fontUrl, { responseType: "arraybuffer" });
      await fs.outputFile(fontPath, data);
      console.log("✅ Font downloaded");
    }
    registerFont(fontPath, { family: "ModernoirBold" });
    console.log("✅ Font registered: ModernoirBold");
  } catch (err) {
    console.error("❌ Font preload error:", err);
  }
})();

// -------- Helper function to wrap text --------
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  
  // Draw each line
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
}

module.exports = {
  config: {
    name: "welcome",
    version: "3.1",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    category: "events"
  },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      welcomeMessage:
        "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage: `Hello {userName}.\nWelcome {multiple} to the chat group: {boxName}\nHave a nice {session} 😊`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    try {
      if (event.logMessageType !== "log:subscribe") return;

      console.log("✅ Welcome event triggered");

      const hours = getTime("HH");
      const { threadID } = event;
      const { nickNameBot } = global.GoatBot.config;
      const prefix = global.utils.getPrefix(threadID);
      const dataAddedParticipants = event.logMessageData.addedParticipants;

      // Bot itself added
      if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
        if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
        return message.send(getLang("welcomeMessage", prefix));
      }

      if (!global.temp.welcomeEvent[threadID])
        global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

      global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
      clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

      global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
        const threadData = await threadsData.get(threadID);
        if (threadData.settings.sendWelcomeMessage == false) return;

        const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
        const threadName = threadData.threadName;
        const participantIDs = (await api.getThreadInfo(threadID)).participantIDs;
        const memberCount = participantIDs.length;

        const userName = [], mentions = [];
        let multiple = false;
        if (dataAddedParticipants.length > 1) multiple = true;

        for (const user of dataAddedParticipants) {
          userName.push(user.fullName);
          mentions.push({ tag: user.fullName, id: user.userFbId });
        }
        if (userName.length == 0) return;

        let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
        const form = {
          mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
        };

        welcomeMessage = welcomeMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
          .replace(/\{boxName\}|\{threadName\}/g, threadName)
          .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
          .replace(
            /\{session\}/g,
            hours <= 10
              ? getLang("session1")
              : hours <= 12
                ? getLang("session2")
                : hours <= 18
                  ? getLang("session3")
                  : getLang("session4")
          );

        // --------- Canvas with Random Background ---------
        try {
          const userInfo = dataAddedParticipants[0];
          const avatarUrl = `https://graph.facebook.com/${userInfo.userFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

          const backgrounds = [
            "https://files.catbox.moe/cj68oa.jpg",
            "https://files.catbox.moe/0n8mmb.jpg",
            "https://files.catbox.moe/hvynlb.jpg",
            "https://files.catbox.moe/leyeuq.jpg",
            "https://files.catbox.moe/7ufcfb.jpg",
            "https://files.catbox.moe/y78bmv.jpg"
          ];
          const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

          const canvas = createCanvas(1000, 400);
          const ctx = canvas.getContext("2d");

          // Background
          const bg = await loadImage((await axios.get(randomBg, { responseType: "arraybuffer" })).data);
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

          // Avatar circle left
          const avatar = await loadImage((await axios.get(avatarUrl, { responseType: "arraybuffer" })).data);
          ctx.save();
          ctx.beginPath();
          ctx.arc(200, 200, 150, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatar, 50, 50, 300, 300);
          ctx.restore();

          // -------- TEXT RIGHT SIDE --------
          ctx.textAlign = "left";
          ctx.shadowColor = "rgba(0,0,0,0.6)";
          ctx.shadowBlur = 6;

          const textX = 400;
          let textY = 150;
          const maxWidth = 550;

          // Username (keep as-is)
          ctx.font = "bold 70px ModernoirBold";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(userInfo.fullName, textX, textY);

          // WELCOME TO groupname (wrap if long)
          ctx.font = "bold 30px ModernoirBold";
          ctx.fillStyle = "#ffea00";
          wrapText(ctx, `WELCOME TO ${threadName}`, textX, textY + 90, maxWidth, 60);

          // Member number (wrap if long)
          ctx.font = "bold 32px ModernoirBold";
          ctx.fillStyle = "#00ffcc";
          wrapText(ctx, `You're ${memberCount}th member of this group`, textX, textY + 190, maxWidth, 50);

          // Save image
          const imgPath = path.join(__dirname, "cache", `welcome_${userInfo.userFbId}.png`);
          await fs.ensureDir(path.dirname(imgPath));
          const out = fs.createWriteStream(imgPath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          await new Promise((resolve) => out.on("finish", resolve));

          form.body = welcomeMessage;
          form.attachment = fs.createReadStream(imgPath);

          message.send(form, () => fs.unlinkSync(imgPath));
          console.log("✅ Welcome message sent with image");
        } catch (err) {
          console.error("❌ Canvas error:", err);
          form.body = welcomeMessage + "\n\n(Canvas failed, sending text only)";
          message.send(form);
        }

        delete global.temp.welcomeEvent[threadID];
      }, 1500);
    } catch (err) {
      console.error("❌ Welcome event error:", err);
    }
  }
};
