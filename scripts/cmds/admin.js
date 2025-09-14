const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "1.8",
    author: "Arijit",
    countDown: 5,
    role: 2,
    description: {
      en: "Add, remove, or list bot admins"
    },
    category: "box chat",
    guide: {
      en: "{pn} [add|-a] <uid|@tag> | {pn} [remove|-r] <uid|@tag> | {pn} [list|-l]"
    }
  },

  langs: {
    en: {
      added: "✔ Added admin role for %1 users:\n%2",
      alreadyAdmin: "ℹ %1 users already have admin role:\n%2",
      missingIdAdd: "⚠ Please enter ID or tag user to add admin role",
      removed: "✔ Removed admin role of %1 users:\n%2",
      notAdmin: "ℹ %1 users don't have admin role:\n%2",
      missingIdRemove: "⚠ Please enter ID or tag user to remove admin role",
      listAdmin: "👑 𝐋𝐢𝐬𝐭 𝐨𝐟 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬 👑\n\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, role }) {
    const sendUserTag = async (uid) => {
      if (!uid || uid === "0") return null;
      let name = await usersData.getName(uid);
      return {
        name: name && name.trim() !== "" ? name : "Unknown",
        uid
      };
    };

    const action = (args[0] || "").toLowerCase();

    // ✅ "list" সবাই ব্যবহার করতে পারবে
    if (action === "list" || action === "-l") {
      if (!config.adminBot.length)
        return message.reply(getLang("listAdmin", "No admins found"));

      const adminList = (await Promise.all(config.adminBot.map(sendUserTag)))
        .filter(Boolean)
        .map(user => `╭➢ 𝐍𝐚𝐦𝐞: ${user.name}\n╰➢ 𝐔𝐢𝐝: ${user.uid}`)
        .join("\n\n");

      return message.reply(getLang("listAdmin", adminList));
    }

    // 🚫 add/remove => শুধু role >= 2 (bot-admin) ব্যবহার করতে পারবে
    if (role < 2) {
      return message.reply("⛔ You don't have permission to use this command.");
    }

    switch (action) {
      case "add":
      case "-a": {
        if (!args[1] && Object.keys(event.mentions).length === 0 && !event.messageReply)
          return message.reply(getLang("missingIdAdd"));

        let uids = Object.keys(event.mentions).length
          ? Object.keys(event.mentions)
          : event.messageReply
            ? [event.messageReply.senderID]
            : args.slice(1).filter(arg => !isNaN(arg));

        const notAdminIds = uids.filter(uid => !config.adminBot.includes(uid));
        const alreadyAdminIds = uids.filter(uid => config.adminBot.includes(uid));

        if (notAdminIds.length) config.adminBot.push(...notAdminIds);

        const addedNames = (await Promise.all(notAdminIds.map(sendUserTag)))
          .filter(Boolean)
          .map(user => `- ${user.name} (${user.uid})`);
        const alreadyNames = (await Promise.all(alreadyAdminIds.map(sendUserTag)))
          .filter(Boolean)
          .map(user => `- ${user.name} (${user.uid})`);

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        return message.reply(
          (addedNames.length ? getLang("added", notAdminIds.length, addedNames.join("\n")) + "\n" : "") +
          (alreadyNames.length ? getLang("alreadyAdmin", alreadyAdminIds.length, alreadyNames.join("\n")) : "")
        );
      }

      case "remove":
      case "-r": {
        if (!args[1] && Object.keys(event.mentions).length === 0 && !event.messageReply)
          return message.reply(getLang("missingIdRemove"));

        let uids = Object.keys(event.mentions).length
          ? Object.keys(event.mentions)
          : event.messageReply
            ? [event.messageReply.senderID]
            : args.slice(1).filter(arg => !isNaN(arg));

        const adminIds = uids.filter(uid => config.adminBot.includes(uid));
        const notAdminIds = uids.filter(uid => !config.adminBot.includes(uid));

        config.adminBot = config.adminBot.filter(uid => !adminIds.includes(uid));

        const removedNames = (await Promise.all(adminIds.map(sendUserTag)))
          .filter(Boolean)
          .map(user => `- ${user.name} (${user.uid})`);
        const notAdminNames = (await Promise.all(notAdminIds.map(sendUserTag)))
          .filter(Boolean)
          .map(user => `- ${user.name} (${user.uid})`);

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        return message.reply(
          (removedNames.length ? getLang("removed", adminIds.length, removedNames.join("\n")) + "\n" : "") +
          (notAdminNames.length ? getLang("notAdmin", notAdminIds.length, notAdminNames.join("\n")) : "")
        );
      }

      default:
        return message.reply(this.config.guide.en);
    }
  }
};
