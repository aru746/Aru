const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "rip",
    version: "1.2",
    author: "MILAN + modified",
    countDown: 5,
    role: 0,
    shortDescription: "Generate RIP image",
    longDescription: "Creates a RIP image from mentioned user or replied user",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | reply]",
      en: "{pn} [@tag | reply]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    let uid;

    // case 1: user mentioned
    if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    }
    // case 2: user replied
    else if (event.messageReply) {
      uid = event.messageReply.senderID;
    }

    if (!uid) return message.reply("❌ | Please mention someone or reply to their message.");

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Rip().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_Rip.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));

      await message.reply({
        attachment: fs.createReadStream(pathSave)
      });

      fs.unlinkSync(pathSave);
    } catch (e) {
      message.reply("❌ | Failed to generate RIP image.");
      console.error(e);
    }
  }
};
