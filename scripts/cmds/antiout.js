module.exports = {
  config: {
    name: "antiout",
    version: "1.0",
    author: "AceGun",
    countDown: 5,
    role: 2,
    shortDescription: "Enable or disable antiout",
    longDescription: "Prevent members from leaving the group by automatically re-adding them.",
    category: "box chat",
    guide: "{pn} [on | off]",
    envConfig: {
      deltaNext: 5
    }
  },

  onStart: async function ({ message, event, threadsData, args }) {
    let antiout = await threadsData.get(event.threadID, "settings.antiout");
    if (antiout === undefined) {
      await threadsData.set(event.threadID, false, "settings.antiout");
      antiout = false;
    }

    if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
      return message.reply("⚙️ | Please use:\nantiout on → enable\nantiout off → disable");
    }

    const newStatus = args[0].toLowerCase() === "on";
    await threadsData.set(event.threadID, newStatus, "settings.antiout");

    return message.reply(`✅ | Antiout has been ${newStatus ? "enabled" : "disabled"}.`);
  },

  onEvent: async function ({ api, event, threadsData }) {
    const antiout = await threadsData.get(event.threadID, "settings.antiout");
    if (!antiout) return;

    if (event.logMessageType === "log:unsubscribe" && event.logMessageData?.leftParticipantFbId) {
      const userId = event.logMessageData.leftParticipantFbId;

      // Skip if bot leaves
      if (userId === api.getCurrentUserID()) return;

      try {
        const threadInfo = await api.getThreadInfo(event.threadID);

        if (!threadInfo.participantIDs.includes(userId)) {
          await api.addUserToGroup(userId, event.threadID);
          console.log(`🔄 Antiout active: ${userId} re-added to the group.`);
        }
      } catch (err) {
        console.log(`❌ Antiout error: Could not re-add ${userId} → ${err.message}`);
      }
    }
  }
};
