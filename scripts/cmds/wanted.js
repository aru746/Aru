const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "wanted",
    version: "1.2",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    shortDescription: "Generate Wanted poster",
    longDescription: "Creates a Wanted poster of the mentioned or replied user",
    category: "image",
    guide: {
      en: "{pn} [@tag | reply]"
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag hoặc reply người bạn muốn làm poster Wanted"
    },
    en: {
      noTag: "❌ | You must mention or reply to the person you want to make a wanted poster"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    let uid;

    // Case 1: Mentioned
    if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    }
    // Case 2: Replied
    else if (event.messageReply) {
      uid = event.messageReply.senderID;
    }

    if (!uid) return message.reply(getLang("noTag"));

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Wanted().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_Wanted.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));

      // Remove mention UID from args text if exists
      const content = args.join(" ").replace(uid, "");

      await message.reply({
        body: `${content || "🔫 𝐖𝐚𝐧𝐭𝐞𝐝 𝐦𝐨𝐦𝐞𝐧𝐭!"}`,
        attachment: fs.createReadStream(pathSave)
      });

      fs.unlinkSync(pathSave);
    } catch (e) {
      message.reply("❌ | Failed to generate wanted image.");
      console.error(e);
    }
  }
};
