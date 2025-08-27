const axios = require("axios");
const fs = require("fs-extra");
const { drive } = global.utils;

module.exports = {
  config: {
    name: "rankup",
    version: "2.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Rank-up notification system",
    longDescription: "Sends a rank-up card when user levels up. Supports custom backgrounds.",
    category: "rank"
  },

  onStart: async function ({ args, threadsData, message, event }) {
    const threadID = event.threadID;
    let data = await threadsData.get(threadID, "data") || {};

    if (!args[0]) {
      return message.reply("⚙️ Usage: rankup [on|off|setbg|delbg]");
    }

    switch (args[0]) {
      case "on":
        data.rankup = { ...data.rankup, enabled: true };
        await threadsData.set(threadID, data, "data");
        return message.reply("✅ Rank-up messages enabled");

      case "off":
        data.rankup = { ...data.rankup, enabled: false };
        await threadsData.set(threadID, data, "data");
        return message.reply("❌ Rank-up messages disabled");

      case "setbg":
        if (event.messageReply?.attachments?.[0]) {
          const fileUrl = event.messageReply.attachments[0].url;
          data.rankup = { ...data.rankup, background: fileUrl };
          await threadsData.set(threadID, data, "data");
          return message.reply("🖼️ Rank-up background set.");
        }
        return message.reply("⚠️ Reply to an image to set background.");

      case "delbg":
        if (data.rankup?.background) {
          delete data.rankup.background;
          await threadsData.set(threadID, data, "data");
          return message.reply("🗑️ Rank-up background removed.");
        }
        return message.reply("⚠️ No background set yet.");
    }
  },

  onChat: async function ({ event, usersData, threadsData, message }) {
    const { senderID, threadID } = event;
    const data = await threadsData.get(threadID, "data");
    if (!data.rankup?.enabled) return;

    const userInfo = await usersData.get(senderID);
    const oldLevel = userInfo.level || 1;
    const expToNext = (oldLevel + 1) * 100;

    if (userInfo.exp >= expToNext) {
      const newLevel = oldLevel + 1;
      userInfo.level = newLevel;
      await usersData.set(senderID, userInfo);

      let body = `🎉 Congratulations ${userInfo.name}!\nYou leveled up to **Level ${newLevel}** ✨`;

      let attachment = [];
      if (data.rankup.background) {
        try {
          const file = await drive.getFile(data.rankup.background, "stream");
          attachment.push(file);
        } catch (err) {
          console.error(err);
        }
      }

      return message.reply({
        body,
        mentions: [{ tag: userInfo.name, id: senderID }],
        attachment
      });
    }
  }
};
