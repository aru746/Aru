module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pnd"],
    version: "1.0",
    author: "Arijit",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "",
      en: ""
    },
    longDescription: {
      vi: "",
      en: ""
    },
    category: "Goat-alAuthor"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not an invalid number",
      cancelSuccess: "Refused %1 thread!",
      approveSuccess: "Approved successfully %1 threads!",
      cantGetPendingList: "Can't get the pending list!",
      returnListPending: "»「PENDING」«❮ The whole number of threads to approve is: %1 thread ❯\n\n%2",
      returnListClean: "「PENDING」There is no thread in the pending list"
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    if ((isNaN(body) && body.indexOf("c") === 0) || body.indexOf("cancel") === 0) {
      const index = (body.slice(1)).split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length)
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[singleIndex - 1].threadID);
        count++;
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } else {
      const index = body.split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length)
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        api.sendMessage(
          `✅ | 𝗚𝗿𝗼𝘂𝗽 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆  

⋆ ────── ⋆✩⋆ ────── ⋆
𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐢𝐧𝐯𝐢𝐭𝐢𝐧𝐠 𝐦𝐞 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩 𝐢 𝐡𝐨𝐩𝐞 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐢𝐬 𝐝𝐨𝐢𝐧𝐠 𝐰𝐞𝐥𝐥 🐱🎀 
─────────────────

╭➢ 𝐏𝐫𝐞𝐟𝐢𝐱 : [ ! ]  
├➢ 𝐁𝐨𝐭 : [ 𝐀𝐥𝐲𝐚 𝐂𝐡𝐚𝐧🐱🎀 ]  
╰➢ 𝐀𝐝𝐦𝐢𝐧 : 𝐀 𝐑 𝐈 𝐉 𝐈 𝐓 👑`,
          Reply.pending[singleIndex - 1].threadID
        );
        count++;
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }

    const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

    for (const single of list) {
      msg += `${index++}/ ${single.name} (${single.threadID})\n`;
    }

    if (list.length !== 0) {
      return api.sendMessage(
        getLang("returnListPending", list.length, msg),
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            pending: list
          });
        },
        messageID
      );
    } else {
      return api.sendMessage(getLang("returnListClean"), threadID, messageID);
    }
  }
};
