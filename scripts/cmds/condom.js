const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "condom",
    aliases: ["cd"],
    version: "1.0",
    author: "mahim",
    countDown: 5,
    role: 0,
    shortdescription: "Make fun of your friends",
    longDescription: "Make fun of your friends using crazy condom fails",
    category: "fun",
    guide: ""
  },

  onStart: async function ({ message, event, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) {
      return message.reply("❌ | You must tag a person.");
    }

    let targetUID = mention[0];

    // 🚫 Owner protection
    if (targetUID === "100069254151118") {
      return message.reply("🚫 You deserve this, not my owner! 😙.");
    }

    try {
      const imagePath = await bal(targetUID);
      await message.reply({
        body: "🤣 Ops Crazy Condom Fails!",
        attachment: fs.createReadStream(imagePath)
      });
      fs.unlinkSync(imagePath); // clean up temp file
    } catch (error) {
      console.error("Error while running condom command:", error);
      await message.reply("❌ | An error occurred, please try again later.");
    }
  }
};

async function bal(uid) {
  const avatar = await jimp.read(
    `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
  );
  const template = await jimp.read("https://i.postimg.cc/jjd785CM/cLEixM0.jpg");
  
  template.resize(512, 512).composite(avatar.resize(263, 263), 256, 258);

  const imagePath = `condom_${uid}.png`;
  await template.writeAsync(imagePath);
  return imagePath;
}
