const fs = require("fs");

module.exports.config = {
    name: "kickall",
    version: "1.0.0",
    aliases: ["kick-all"]
    role: 2, // শুধু owner/অ্যাডমিন চালাতে পারবে
    author: "BAYEJID",
    cooldowns: 5,
    description: "Kick all members from the group",
    category: "admin"
};

module.exports.run = async function ({ api, event }) {
    try {
        const threadID = event.threadID;
        const senderID = event.senderID;

        // শুধু owner (তোমার UID) চালাতে পারবে
        const OWNER = "100069254151118"; // <-- তোমার Facebook UID এখানে বসাও
        if (senderID != OWNER) {
            return api.sendMessage("❌ You don't have enough permission to use this command. Only My Lord can use it.", threadID);
        }

        // গ্রুপের সব মেম্বার ফেচ
        const threadInfo = await api.getThreadInfo(threadID);
        const members = threadInfo.participantIDs;

        await api.sendMessage("⚠ সব মেম্বারকে কিক করা শুরু হলো...", threadID);

        for (const uid of members) {
            if (uid != OWNER && uid != api.getCurrentUserID()) {
                try {
                    await api.removeUserFromGroup(uid, threadID);
                } catch (e) {
                    console.log(`❌ কিক করা যায়নি: ${uid}`);
                }
            }
        }

        await api.sendMessage("✅ সব মেম্বারকে কিক করা শেষ!", threadID);

    } catch (err) {
        console.error(err);
        api.sendMessage("❌ কিছু একটা সমস্যা হয়েছে।", event.threadID);
    }
};
