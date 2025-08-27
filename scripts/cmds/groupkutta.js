const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

const OWNER_ID = "100069254151118"; // ✅ Your UID here

module.exports = {
  config: {
    name: "groupkutta",
    aliases: ["gk"],
    version: "1.0.4",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: "Make a group of kutte 🐶",
    longDescription: "Replace dog heads in image with random avatars and the tagged/replied user as the leader kutta",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) return message.reply("🐶 Tag or reply to someone to make them the main kutta!");

    // 🚫 Owner protection
    if (targetID === OWNER_ID) {
      return message.reply("🚫 You deserve this, not my owner! 😙");
    }

    const baseFolder = path.join(__dirname, "NAFIJ");
    const bgPath = path.join(baseFolder, "group_kutta.jpg");
    const outputPath = path.join(baseFolder, `groupkutta_${Date.now()}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      // ✅ Download background if missing
      if (!fs.existsSync(bgPath)) {
        const kuttaURL = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/kutta.jpeg";
        const kuttaImage = await axios.get(kuttaURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, kuttaImage.data);
      }

      const bg = await jimp.read(bgPath);
      bg.resize(619, 495);

      // ✅ Get 4 random members, **exclude owner**
      const threadInfo = await api.getThreadInfo(event.threadID);
      const allParticipants = threadInfo.participantIDs.filter(
        id => id !== targetID && id !== api.getCurrentUserID() && id !== OWNER_ID
      );

      if (allParticipants.length < 4) {
        return message.reply("❌ Not enough people in this chat to make a full kutta gang (need 5 total).");
      }

      const random4 = allParticipants.sort(() => 0.5 - Math.random()).slice(0, 4);
      const allIDs = [...random4, targetID];

      // 🐶 Avatar placement positions
      const positions = [
        { x: 18, y: 60, size: 60 },
        { x: 70, y: 185, size: 70 },
        { x: 210, y: 145, size: 80 },
        { x: 345, y: 120, size: 80 },
        { x: 370, y: 320, size: 100 }
      ];

      // 🧠 Overlay avatars
      for (let i = 0; i < allIDs.length; i++) {
        const id = allIDs[i];
        const pos = positions[i];

        const avatarBuffer = (
          await axios.get(
            `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            { responseType: "arraybuffer" }
          )
        ).data;

        const avatar = await jimp.read(avatarBuffer);
        avatar.resize(pos.size, pos.size);
        bg.composite(avatar, pos.x, pos.y);
      }

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Someone";

      await message.reply({
        body: `🤣🐕 Meet the kutta gang, led by ${tagName}!`,
        attachment: fs.createReadStream(outputPath),
        mentions: [{ tag: tagName, id: targetID }]
      }, () => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("❌ Group Kutta Error:", err);
      return message.reply("❌ Error while making the kutta gang.");
    }
  }
};
