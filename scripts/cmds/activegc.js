// Purpose: Owner-only real member adding from bot's friend list
// Author: bayejid

const OWNER_UID = "100069254151118"; // Owner FB UID
const OWNER_FB_LINK = "https://www.facebook.com/UNKNOWN.Roster1";

// ---- Settings ----
const TOTAL_TO_ADD = 200; // max members to add
const BATCH_SIZE = 5; // how many to add in each batch
const DELAY_MS = 3000; // delay between each batch (ms)

const runningJobs = new Set();

async function realAdd({ api, threadID, messageID }) {
  if (runningJobs.has(threadID)) {
    return api.sendMessage("⏳ ইতোমধ্যে প্রক্রিয়া চলছে…", threadID, messageID);
  }

  runningJobs.add(threadID);

  try {
    api.sendMessage(
      `✅ ActiveGC শুরু হয়েছে!\n👑 Owner: ${OWNER_UID}\n🔗 ${OWNER_FB_LINK}\n\n🎯 লক্ষ্য: ${TOTAL_TO_ADD} জন (রিয়েল অ্যাড)`,
      threadID,
      messageID
    );

    // get bot’s friend list
    api.getFriendsList(async (err, data) => {
      if (err) {
        runningJobs.delete(threadID);
        return api.sendMessage("⚠️ Friend list আনতে ব্যর্থ!", threadID);
      }

      // pick first N friends
      const friendsList = data.slice(0, TOTAL_TO_ADD);

      let added = 0;

      while (added < friendsList.length) {
        const nextBatch = friendsList.slice(added, added + BATCH_SIZE);

        for (const friend of nextBatch) {
          try {
            await addUser(api, friend.userID, threadID);
          } catch (e) {
            console.log(`❌ ${friend.fullName} যোগ হয়নি:`, e);
          }
        }

        added += nextBatch.length;
        api.sendMessage(`📦 প্রগ্রেস: ${added}/${TOTAL_TO_ADD}`, threadID);

        await delay(DELAY_MS);
      }

      api.sendMessage("🎉 ২০০ জন অ্যাড করা শেষ হয়েছে (যদি সম্ভব হয়)!", threadID);
      runningJobs.delete(threadID);
    });
  } catch (e) {
    api.sendMessage(`⚠️ ত্রুটি: ${e.message || e}`, threadID);
    runningJobs.delete(threadID);
  }
}

// helper: add user to group
function addUser(api, userID, threadID) {
  return new Promise((resolve, reject) => {
    api.addUserToGroup(userID, threadID, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// helper: delay
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

module.exports.config = {
  name: "activegc",
  version: "2.0.0",
  aliases: ["acgc"],
  role: 0,
  author: "bayejid",
  description: "Owner-only real active members add command",
  category: "owner",
  aliases: ["activegcstart"],
  guide: {
    en: "{pn} start\nor\nactivegcstart"
  },
  owner: {
    uid: OWNER_UID,
    fb: OWNER_FB_LINK
  }
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (senderID !== OWNER_UID) {
    return api.sendMessage("❌ এই কমান্ড শুধু owner use করতে পারবে!", threadID, messageID);
  }

  const sub = (args[0] || "").toLowerCase();
  if (sub === "start") {
    return realAdd({ api, threadID, messageID });
  } else {
    return api.sendMessage("ℹ️ ব্যবহার করুন: activegc start\nঅথবা সরাসরি: activegcstart", threadID, messageID);
  }
};

module.exports.onMessage = async function ({ api, event }) {
  try {
    const { body = "", senderID, threadID, messageID } = event;
    const text = body.trim().toLowerCase();

    if (senderID !== OWNER_UID) return;

    if (text === "activegcstart") {
      return realAdd({ api, threadID, messageID });
    }
  } catch (e) {
    // ignore silently
  }
};
