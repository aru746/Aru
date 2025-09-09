module.exports = {
  config: {
    name: "gc",
    author: "Tawsif~",
    category: "fun",
    version: "2.0",
    countDown: 5,
    role: 0,
    guide: {
      en: `<text> ++ <text> | reply | --user <uid> | --theme <theme number> | --attachment <image url> | blank
THEMES:
0. lo-fi
1. bubble tea
2. swimming
3. lucky pink
4. default
5. monochrome
Adding more themes soon`
    }
  },

  onStart: async function ({ message, usersData, event, args, api }) {
    try {
      let prompt = args.join(" ").split("\n").join("++");
      if (!prompt) {
        return message.reply("❌ | Provide a text");
      }

      let id = event.senderID;

      // Handle replied message user
      if (event.messageReply) {
        if (prompt.includes("--user")) {
          if ((prompt.split("--user ")[1].split(" ")[0]).match(/.com/)) {
            id = await api.getUID(prompt.split("--user ")[1].split(" ")[0]);
          } else {
            id = (prompt.split("--user ")[1]).split(" ")[0];
          }
        } else {
          id = event.messageReply.senderID;
        }
      } else if (prompt.includes("--user")) {
        if ((prompt.split("--user ")[1].split(" ")[0]).match(/.com/)) {
          id = await api.getUID(prompt.split("--user ")[1].split(" ")[0]);
        } else {
          id = (prompt.split("--user ")[1]).split(" ")[0];
        }
      }

      // Theme handling
      let themeID = 4;
      if (prompt.includes("--theme")) {
        themeID = (prompt.split("--theme ")[1]).split(" ")[0];
      }

      // Special condition for specific sender IDs
      if (
        event?.messageReply?.senderID === "100063840894133" ||
        event?.messageReply?.senderID === "100083343477138"
      ) {
        if (
          event.senderID !== "100063840894133" &&
          event.senderID !== "100083343477138"
        ) {
          prompt = "hi guys I'm gay";
          id = event.senderID;
        }
      }

      const name = (await usersData.getName(id)).split(" ")[0];
      const avatarUrl = await usersData.getAvatarUrl(id);

      let replyImage;
      if (event?.messageReply?.attachments?.[0]) {
        replyImage = event.messageReply.attachments[0].url;
      } else if (prompt.includes("--attachment")) {
        replyImage = (prompt.split("--attachment ")[1]).split(" ")[0];
      }

      // Remove flags from text
      prompt = prompt.split("--")[0];

      message.reaction("⏳", event.messageID);

      let url = `https://tawsifz-fakechat.onrender.com/image?theme=${themeID}&name=${encodeURIComponent(
        name
      )}&avatar=${encodeURIComponent(avatarUrl)}&text=${encodeURIComponent(
        prompt
      )}`;

      if (replyImage) {
        url += `&replyImageUrl=${encodeURIComponent(replyImage)}`;
      }

      message.reply({
        attachment: await global.utils.getStreamFromURL(url, "gc.png"),
      });

      message.reaction("✅", event.messageID);
    } catch (error) {
      message.reply("❌ | " + error.message);
    }
  }
};
