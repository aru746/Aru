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
    return message.reply(
`Available Font Styles (Arijit):

1: Ă̈r̆̈ĭ̈j̆̈ĭ̈t̆̈
2: 𝘈𝘳𝘪𝘫𝘪𝘵
3: 𝗔𝗿𝗶𝗷𝗶𝘁
4: 🅐🅡🅘🅙🅘🅣
5: ᴬᴿᴵᴶᴵᵀ
6: Ａｒｉｊｉｔ
7: 𝙰𝚛𝚒𝚓𝚒𝚝
8: 𝔸𝕣𝕚𝕛𝕚𝕥
9: 𝘈𝘳𝘪𝘫𝘪𝘵
10: Ａⅈ𝚛𝘪𝘫𝘪𝘵
11: 𝐀𝐫𝐢𝐣𝐢𝐭
12: 🄰🅁🄸🄹🄸🅃
13: Ⓐⓡⓘⓙⓘⓣ
14: 𝕬𝖗𝖎𝖏𝖎𝖙
15: ᵃʳᶤʲᶤᵗ
16: 🅰🆁🅸🅹🅸🆃
17: ᴬᴿᴵᴶᴵᵀ
18: A̷r̷i̷j̷i̷t̷
19: ȺᴿɨᴊᴵŦ
20: Aяιjιт`
    );
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
