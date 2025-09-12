const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "2.0",
    author: "Arijit",
    countDown: 5,
    role: 2,
    description: {
      en: "Send notification from admin Aru to all groups"
    },
    category: "owner",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage: "❌ Please enter the message you want to send to all groups",
      sendingNotification: "🔄 Starting to send notification to %1 chat groups...",
      sentNotification: "✅ Successfully sent notification to %1 groups",
      errorSendingNotification: "⚠️ An error occurred while sending to %1 groups:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0])
      return message.reply(getLang("missingMessage"));

    // Styled notification format
    const formSend = {
      body: `>🎀\n 𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐟𝐫𝐨𝐦 𝐀𝐝𝐦𝐢𝐧 𝐀𝐫𝐮
─────────────────────────
${args.join(" ")}`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    // Get all groups where bot is present
    const allThreadID = (await threadsData.getAll())
      .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSuccess = 0;
    const sendError = [];
    const waitingSend = [];

    // Send to each group with delay
    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        waitingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      }
      catch (e) {
        sendError.push({
          threadIDs: [tid],
          errorDescription: e?.errorDescription || e?.message || "Unknown error"
        });
      }
    }

    // Check results
    for (const sended of waitingSend) {
      try {
        await sended.pending;
        sendSuccess++;
      }
      catch (e) {
        const errorDescription = e?.errorDescription || e?.message || "Unknown error";
        const existing = sendError.find(item => item.errorDescription === errorDescription);
        if (existing)
          existing.threadIDs.push(sended.threadID);
        else
          sendError.push({ threadIDs: [sended.threadID], errorDescription });
      }
    }

    // Final report
    let msg = "";
    if (sendSuccess > 0)
      msg += getLang("sentNotification", sendSuccess) + "\n";
    if (sendError.length > 0) {
      msg += getLang(
        "errorSendingNotification",
        sendError.reduce((a, b) => a + b.threadIDs.length, 0),
        sendError.reduce(
          (a, b) => a + `\n - ${b.errorDescription}\n   ➜ ${b.threadIDs.join("\n   ➜ ")}`,
          ""
        )
      );
    }

    message.reply(msg.trim());
  }
};
