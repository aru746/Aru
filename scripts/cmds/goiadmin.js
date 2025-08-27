module.exports = {
  config: {
    name: "goiadmin",
    author: "𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿",
    role: 0,
    shortDescription: "Auto reply when someone mentions Arijit",
    longDescription: "Replies with random funny messages when boss is mentioned",
    category: "BOT",
    guide: "{pn}"
  },

  onChat: function ({ api, event }) {
    // Only reply if the sender is not the boss
    if (event.senderID !== "100069254151118") {
      const bossIDs = ["100069254151118"]; // Boss UIDs
      for (const id of bossIDs) {
        if (event.mentions.hasOwnProperty(id)) {
          const msg = [
            "👋 এই যে বাবু! Aru বস এখন ব্যস্ত আছেন 😼 যা বলার আমাকেই বলুন ❤",
            "বসকে এতো মিনশন না দিয়ে সরাসরি inbox করো 😼",
            "Aru বস এখন মশা মারার মিশনে আছে, পরে কথা বলবে 😹",
            "Aru Boss এখন কাজে ব্যস্ত… এখন আমার boss রে disturb করবেন না 🐱",
            "সবাই সুধু Aru boss রে mention দেয়.... আমাকে কেও দেয় না 🙂💔",
            "বস ব্যস্ত! জরুরি হলে আমাকে tag করো, আমি তাড়াতাড়ি respond করি 😌😁",
            "😼 Aru বস এখন মগে চা নিয়ে Titanic pose দিচ্ছে ☕🚢",
          ];
          return api.sendMessage(
            msg[Math.floor(Math.random() * msg.length)],
            event.threadID,
            event.messageID
          );
        }
      }
    }
  },

  onStart: async function () {}
};
