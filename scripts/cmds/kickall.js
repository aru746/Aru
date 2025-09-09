const fs = require("fs");

module.exports.config = {
    name: "kickall",
    version: "1.0.0",
    aliases: ["kick-all"],
    role: 2, // শুধু owner/অ্যাডমিন চালাতে পারবে
    author: "BAYEJID",
    cooldowns: 5,
    description: "Kick all members from the group",
    category: "admin"
};

module.exports.onStart = async function ({ api, event }) {
    try {
        const threadID = event.threadID;
        const senderID = event.senderID;

        // শুধু owner (তোমার UID) চালাতে পারবে
        const OWNER = "100069254151118"; // <-- এখানে নিজের UID বসাও
        if (senderID !== OWNER) {
            return api.sendMessage(
                "❌ You don't have enough permission to use this command. Only My Lord can use it.",
                threadID
            );
        }

        // প্রথমে কনফার্মেশন চাই
        await api.sendMessage(
            "⚠ আপনি কি নিশ্চিত যে গ্রুপের সবাইকে কিক করবেন?\n\nReply 'yes' to confirm.",
            threadID,
            (err, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "confirm",
                    author: senderID
                });
            }
        );
    } catch (err) {
        console.error(err);
        api.sendMessage("❌ কিছু একটা সমস্যা হয়েছে।", event.threadID);
    }
};

module.exports.onReply = async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body } = event;

    if (Reply.type === "confirm" && senderID === Reply.author) {
        if (body.toLowerCase() === "yes") {
            try {
                const threadInfo = await api.getThreadInfo(threadID);
                const members = threadInfo.participantIDs;

                await api.sendMessage("⚠ সবাইকে কিক করা শুরু হলো...", threadID);

                for (const uid of members) {
                    if (uid !== senderID && uid !== api.getCurrentUserID()) {
                        try {
                            await api.removeUserFromGroup(uid, threadID);
                        } catch (e) {
                            console.log(`❌ কিক করা যায়নি: ${uid}`, e.message);
                        }
                    }
                }

                await api.sendMessage("✅ সব মেম্বারকে কিক করা শেষ!", threadID);
            } catch (err) {
                console.error(err);
                api.sendMessage("❌ কিছু একটা সমস্যা হয়েছে।", threadID);
            }
        } else {
            api.sendMessage("❌ কিক অপারেশন বাতিল করা হয়েছে।", threadID);
        }

        // reply session মুছে দাও
        global.GoatBot.onReply.delete(messageID);
    }
};
