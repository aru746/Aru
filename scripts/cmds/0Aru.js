module.exports = {
  config: {
    name: "aru",
    aliases: ["arijit", "aru","arjit"],
    version: "1.0",
    author: "kuze", // remodified by cliff
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "auto",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    const triggers = ["arijit", "aru","arjit"];
    if (event.body && triggers.includes(event.body.toLowerCase())) {
      return message.reply({
        body: `Aru boss নেই এখন😑`,
        attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/pql861.mp4"),
      });
    }
  }
};
