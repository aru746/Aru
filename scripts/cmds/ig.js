const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "ig",
    version: "2.0",
    author: "ＡＲＩＪＩＴ ᶻ 𝗓 𐰁",
    countDown: 5,
    role: 0,
    shortDescription: "বাংলা নোট + ছবি",
    longDescription: "Random Bengali styled quote with aesthetic image",
    category: "fun",
    guide: "{prefix}ig or !",
    usePrefix: false
  },

  onStart: async function ({ api, event }) {
    return sendQuoteWithImage(api, event);
  },

  onChat: async function ({ api, event }) {
    const body = event.body?.toLowerCase().trim();
    if (body === "/" || body === "ig") {
      return sendQuoteWithImage(api, event);
    }
  }
};

// All styled Bengali quotes
function getFormattedQuote() {
  const quotes = [
`🖤 ━━━ 𝙇𝙤𝙣𝙚𝙡𝙞𝙣𝙚𝙨𝙨 ━━━ 🖤

"কেউ পাশে থাকুক বা না থাকুক,  
নিজেকে ভালোবাসতে শিখো… একদিন সব ঠিক হবে।🌑"

🔲 Feeling: Alone  
🗯️ Thought Level: Calm Darkness

━━━━━━━━━━━━━━━━━━━━━━━  
🖋️ ＡＲＩＪＩＴ ᶻ 𝗓 𐰁 | Midnight Mind`,

`💔 ━━━ 𝘽𝙧𝙤𝙠𝙚𝙣 𝙎𝙤𝙪𝙡 ━━━ 💔

"একটা সময় ছিলো...  
যার হাসির জন্য নিজেকে ভেঙে ফেলতাম…  
আজ সে অন্য কারো পাশে হাসছে।"

🧩 Feeling: Shattered  
📍 Location: Past Memories

━━━━━━━━━━━━━━━━━━━━━━━  
🖊️ ＡＲＩＪＩＴ ᶻ 𝗓 𐰁 | Heart Echoes`,

`🌸 ━━━ 𝙁𝙚𝙚𝙡𝙞𝙣𝙜 𝙎𝙤𝙛𝙩 ━━━ 🌸

"তুমি পাশে থাকলে বৃষ্টিও মনে হয় রোদ্দুর...  
তোমার হাসি আমার সকাল।🕊️💗"

🎨 Mood: Dreamy Love  
🕰️ Shared with: Heart

━━━━━━━━━━━━━━━━━━━━━━━  
💌 ＡＲＩＪＩＴ ᶻ 𝗓 𐰁 | Hidden Whispers`,

`🔥 ━━━ 𝙎𝙩𝙖𝙣𝙙 𝘼𝙡𝙤𝙣𝙚 ━━━ 🔥

"কারো ছায়া হয়ে বাঁচবো না —  
নিজেই আলো হবো! 🕯️"

💪 Power: Unshakable  
📛 Mood: 🔥 Ignited

━━━━━━━━━━━━━━━━━━━━━━━  
🖋️ ＡＲＩＪＩＴ ᶻ 𝗓 𐰁 | Solo Vibes`,

`🌙 ━━━ 𝙉𝙞𝙜𝙝𝙩 𝙈𝙤𝙤𝙙 ━━━ 🌙

"রাতের নিস্তব্ধতা বলে দেয়—  
সবচেয়ে আপন মানুষও এক সময় নিঃশব্দ হয়ে যায়…"

🕯️ Silence Level: Max  
🗓️ Time: 2:14 AM

━━━━━━━━━━━━━━━━━━━━━━━  
📖 ＡＲＩＪＩＴ ᶻ 𝗓 𐰁 | Night Scripts`,

`😔 ━━━ 𝙍𝙚𝙜𝙧𝙚𝙩 𝙈𝙤𝙢𝙚𝙣𝙩 ━━━ 😔

"যাকে সবচেয়ে বিশ্বাস করেছিলাম—  
সে-ই শেষ পর্যন্ত আমায় ভেঙে দিলো…"

💢 Emotion: Disbelief  
📍 Place: Mind’s Corner

━━━━━━━━━━━━━━━━━━━━━━━  
🖊️ ＡＲＩＪＩＴ ᶻ 𝗓 𐰁 | Scarred Pages`,

`🔍 ━━━ 𝙍𝙚𝙖𝙡 𝙏𝙖𝙡𝙠 ━━━ 🔍

"মানুষ তখনই বদলায়,  
যখন সে ভাঙতে ভাঙতে ক্লান্ত হয়ে পড়ে।"

🧠 Level: Harsh Truth  
🎯 Delivered: Raw

━━━━━━━━━━━━━━━━━━━━━━━  
✍️ ＡＲＩＪＩＴ ᶻ 𝗓 𐰁 | Deep Talk`
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Random aesthetic image URLs
function getRandomImageURL() {
  const images = [
    "https://i.postimg.cc/L4Cx5RKH/9e67645f927eaae0ba18f19b05622eac.jpg",
    "https://i.postimg.cc/7YXT11nD/780eb0e434ce5ca92e863a92e6cb27cf.jpg",
    "https://i.postimg.cc/1Xsfw4gf/2d1bcd832d2efb496e53cb45190e5325.jpg",
    "https://i.postimg.cc/ryjp7V0N/58137f27ceebf0482a58875d6ded3c1c.jpg",
    "https://i.postimg.cc/KvVmyRZB/1552cbe4d268c5f3a92f8ce0188f9fe7.jpg",
    "https://i.postimg.cc/L5WFRbM2/b68323d41ab7df1274342dd194292ede.jpg",
    "https://i.postimg.cc/nLxbHmNj/456ed64f3c38f3008f5f30f678563409.jpg",
    "https://i.postimg.cc/KYxwX2gt/95bf51e4d462707bf1557bbc47694849.jpg",
    "https://i.postimg.cc/g2mbpRCw/2bb146f811030e9a91b6654ac23101d1.jpg",
    "https://i.postimg.cc/tRxKV2yZ/98b0af95a9349c7705b7febf884e2fad.jpg",
    "https://i.postimg.cc/rwQ3LHGb/d13da3cb14a9630bf859795c26a2c972.jpg"
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// Send message with quote and image
async function sendQuoteWithImage(api, event) {
  const quote = getFormattedQuote();
  const imageUrl = getRandomImageURL();
  const imgPath = path.join(__dirname, "cache", `quote_${Date.now()}.jpg`);

  // Ensure cache dir exists
  fs.ensureDirSync(path.join(__dirname, "cache"));

  // Download image
  await new Promise((resolve, reject) => {
    request(imageUrl)
      .pipe(fs.createWriteStream(imgPath))
      .on("finish", resolve)
      .on("error", reject);
  });

  // Send message with quote + image
  api.sendMessage(
    {
      body: quote,
      attachment: fs.createReadStream(imgPath)
    },
    event.threadID,
    () => fs.unlinkSync(imgPath)
  );
}
