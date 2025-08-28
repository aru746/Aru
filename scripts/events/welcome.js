const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

function toBoldUnicode(name) {
    const boldAlphabet = {
        "a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣",
        "k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭",
        "u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳",
        "A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉",
        "K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓",
        "U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙"
    };
    return name.split("").map(c => boldAlphabet[c] || c).join("");
}

module.exports = {
    config: {
        name: "welcome",
        version: "4.6",
        author: "Arijit (Fixed by ChatGPT)",
        category: "events"
    },

    onStart: async function ({ event, api, threadsData, message }) {
        if (event.logMessageType !== "log:subscribe") return;

        try {
            const { threadID } = event;
            const dataAddedParticipants = event.logMessageData.addedParticipants || [];
            const threadData = await threadsData.get(threadID) || {};
            const threadInfo = await api.getThreadInfo(threadID);

            const threadName = threadData.threadName || threadInfo.threadName || "Group";
            const totalMembers = threadInfo.participantIDs?.length || 0;

            // Male/female count
            const male = threadInfo.userInfo.filter(u => u.gender === "MALE").length;
            const female = threadInfo.userInfo.filter(u => u.gender === "FEMALE").length;

            for (const user of dataAddedParticipants) {
                const uid = user.userFbId;
                const name = user.fullName || "New Member";

                // Avatar (fallback if fails)
                let avatar;
                try {
                    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7C7a7f6f3b95bd29d2a0e1a64c82f9d0d1`;
                    avatar = await loadImage(avatarURL);
                } catch {
                    avatar = await loadImage(__dirname + "/cache/default_avatar.png"); // fallback image
                }

                // Background image
                const bg = await loadImage(__dirname + "/cache/wlc.jpg");
                const canvas = createCanvas(1200, 675);
                const ctx = canvas.getContext("2d");

                // Draw background
                ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

                // Avatar circle
                ctx.save();
                ctx.beginPath();
                ctx.arc(600, 250, 100, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 500, 150, 200, 200);
                ctx.restore();

                // Title
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 70px Arial";
                ctx.textAlign = "center";
                ctx.fillText("WELCOME", 600, 90);

                // Name
                ctx.fillStyle = "#00FFAA";
                ctx.font = "bold 55px Arial";
                ctx.fillText(name, 600, 420);

                // Member count
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "28px Arial";
                ctx.fillText(`You are the ${totalMembers}th member!`, 600, 470);

                // Graph-style stats box
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(250, 500, 700, 120);

                ctx.fillStyle = "#A0CFFF";
                ctx.font = "26px Arial";
                ctx.textAlign = "center";
                ctx.fillText(`${totalMembers} Members • ${male} Male • ${female} Female`, 600, 545);

                ctx.fillStyle = "#FFD700";
                ctx.font = "24px Arial";
                const createdDate = threadData.createdAt
                    ? moment(threadData.createdAt).format("MMM DD, YYYY")
                    : moment().format("MMM DD, YYYY");
                ctx.fillText(`Group created: ${createdDate}`, 600, 575);

                // Time display
                const timeIND = moment.tz("Asia/Kolkata").format("hh:mm A");
                const timeBD  = moment.tz("Asia/Dhaka").format("hh:mm A");
                ctx.fillStyle = "#00FFAA";
                ctx.font = "24px Arial";
                ctx.fillText(`🕒 India: ${timeIND} | Bangladesh: ${timeBD}`, 600, 605);

                // Save & send
                const path = __dirname + `/cache/welcome_${uid}.png`;
                fs.writeFileSync(path, canvas.toBuffer("image/png"));

                await message.send({
                    body: `🎀 Welcome ${toBoldUnicode(name)} to ${toBoldUnicode(threadName)} 🎀\nWe now have ${totalMembers} members!`,
                    attachment: fs.createReadStream(path)
                });

                setTimeout(() => {
                    if (fs.existsSync(path)) fs.unlinkSync(path);
                }, 60_000);
            }
        } catch (err) {
            console.error("❌ Welcome event error:", err);
        }
    }
};
