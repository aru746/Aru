module.exports = {
  config: {
    name: 'ugly',
    aliases: ['notpretty'],
    author: 'HASSAN-',
    version: 2.0,
    role: 0,
    shortDescription: {
      en: 'Rates how ugly something is.'
    },
    longDescription: {
      en: 'Rates the ugliness factor of something based on user input.'
    },
    category: 'fun',
    guide: {
      en: 'Simply use the command followed by the thing you want to rate for ugliness.'
    }
  },
  event: null,
  onStart: async function ({ api, event, args }) {
    const subject = args.join(' ');

    if (!subject) {
      api.sendMessage('Please provide something to rate for ugliness.', event.threadID);
      return;
    }

    const uglinessRating = Math.floor(Math.random() * 10) + 1; // Generating a random ugliness rating from 1 to 10

    api.sendMessage(`𝔸𝕔𝕔𝕠𝕣𝕕𝕚𝕟𝕘 𝕥𝕠 𝕞𝕪 𝕖𝕩𝕡𝕖𝕣𝕥 𝕠𝕡𝕚𝕟𝕚𝕠𝕟, ${subject} 𝕙𝕒𝕤 𝕒𝕟 🤢🤧 𝕦𝕘𝕝𝕚𝕟𝕖𝕤𝕤 𝕣𝕒𝕥𝕚𝕟𝕘 𝕠𝕗 ${uglinessRating}/10.`, event.threadID);
  },
  onChat: async function ({ event, message }) {
    if (event.body && event.body.startsWith('ugly')) {
      const subject = event.body.replace('ugly', '').trim();

      if (!subject) {
        return message.reply('Please specify what you want to rate for ugliness.');
      }

      const uglinessRating = Math.floor(Math.random() * 10) + 1; // Generating a random ugliness rating from 1 to 10

      return message.reply(`🥺𝔸𝕔𝕔𝕠𝕣𝕕𝕚𝕟𝕘 𝕥𝕠 𝕞𝕪 𝕖𝕩𝕡𝕖𝕣𝕥 𝕠𝕡𝕚𝕟𝕚𝕠𝕟, ${subject} 𝕙𝕒𝕤 𝕒𝕟 🤧🤢 𝕦𝕘𝕝𝕚𝕟𝕖𝕤𝕤 𝕣𝕒𝕥𝕚𝕟𝕘 𝕠𝕗 ${uglinessRating}/10.`);
    }
  }
};
