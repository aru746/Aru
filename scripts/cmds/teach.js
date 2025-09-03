const axios = require('axios');

const baseApiUrl = async () => {
    return "https://mahabub-simsimi-api.onrender.com/mahabub_x_imran";
};

module.exports.config = {
    name: "teach",
    aliases: ["learn","bby teach", "jan teach"],
    version: "1.0.0",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",  
    countDown: 0,
    role: 0,
    description: "Teach Mahabub simsimi api new responses!",  
    category: "group",
    guide: {
        en: "{pn} [message] - [reply]"
    }
};

module.exports.onStart = async ({ api, event, args }) => {
    const link = await baseApiUrl();
    const userMessage = args.join(" ").toLowerCase();

    try {
        if (!args[0] || !userMessage.includes(" - ")) {
            return api.sendMessage('❌ | Use format: teach [message] - [reply]', event.threadID, event.messageID);
        }

      const [teachMessage, teachReply] = userMessage.split(" - ");
        const teachAns = teachReply;  
        if (!teachMessage || !teachReply || !teachAns) {
            return api.sendMessage('❌ | All parameters (teachMessage, teachReply, and teachAns) must be provided and valid!', event.threadID, event.messageID);
        }

        const url = `${link}?teach=${encodeURIComponent(teachMessage)}&reply=${encodeURIComponent(teachReply)}&ans=${encodeURIComponent(teachAns)}`;
        console.log('Request URL:', url);

        const response = await axios.get(url);

        console.log('API Response:', response.data);

     if (response.data && response.data.message) {
            // Show the message returned by the API
            return api.sendMessage(`✅ 𝐀𝐥𝐲𝐚 𝐂𝐡𝐚𝐧 🐱🎀: "${teachMessage}" → ${response.data.message}`, event.threadID, event.messageID);
        } else {
            return api.sendMessage('❌ | There was an issue teaching the bot. Please try again!', event.threadID, event.messageID);
        }

    } catch (error) {
        console.error('Error:', error);
        return api.sendMessage(`❌ Mahabub's AI Error: ${error.message}`, event.threadID, event.messageID);
    }
};
