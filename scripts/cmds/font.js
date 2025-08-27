const axios = require("axios");

const Arijit = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud; // keeping API key same, only function renamed
};

module.exports.config = {
  name: "style",
  aliases: ["font"],
  version: "1.7",
  role: 0,
  countDown: 5,
  author: "Arijit",
  category: "general",
  guide: { en: "[number] [text] or list" }
};

module.exports.onStart = async function ({ message, args }) {
  const apiUrl = await Arijit();

  if (args[0] === "list") {
    try {
      const fontList = (await axios.get(`${apiUrl}/api/font/list`)).data.replace("Available Font Styles:", "").trim();
      return fontList 
        ? message.reply(`Available Font Styles (Arijit):\n${fontList}`) 
        : message.reply("No font styles found.");
    } catch {
      return message.reply("Error fetching font styles.");
    }
  }

  const [number, ...textParts] = args;
  const text = textParts.join(" ");
  if (!text || isNaN(number)) return message.reply("Invalid usage. Format: style <number> <text>");

  try {
    const { data: { data: fontData } } = await axios.post(`${apiUrl}/api/font`, { number, text });
    const fontStyle = fontData[number];
    const convertedText = text.split("").map(char => fontStyle[char] || char).join("");
    return message.reply(convertedText);
  } catch {
    return message.reply("Error processing your request.");
  }
};
