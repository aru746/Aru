const { drive } = global.utils;
const moment = require("moment-timezone");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

// Unicode bold converter
function toBoldUnicode(name) {
	const boldAlphabet = {
		"a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
		"k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
		"u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳",
		"A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃", "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉",
		"K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍", "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓",
		"U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗", "Y": "𝐘", "Z": "𝐙",
		"0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
		" ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
	};
	return name.split('').map(char => boldAlphabet[char] || char).join('');
}

// session detector (Morning, Noon, Afternoon, Evening, Night)
function getSession(hour) {
	if (hour >= 5 && hour < 12) return "Morning";
	if (hour >= 12 && hour < 15) return "Noon";
	if (hour >= 15 && hour < 18) return "Afternoon";
	if (hour >= 18 && hour < 21) return "Evening";
	return "Night";
}

module.exports = {
	config: {
		name: "welcome",
		version: "3.2",
		author: "Arijit",
		category: "events"
	},

	langs: {
		en: {
			multiple1: "you",
			multiple2: "all of you",
			defaultWelcomeMessage:
`‎Welcome: [ {userName} ] 
𝐓𝐨 𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩: [ {boxName} ]🎀  

🎀 𝐇𝐚𝐯𝐞 𝐚 𝐧𝐢𝐜𝐞 {session} 😊  

🔰 𝐈 𝐡𝐨𝐩𝐞 𝐲𝐨𝐮 𝐟𝐨𝐥𝐥𝐨𝐰 𝐨𝐮𝐫 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩 𝐫𝐮𝐥𝐞𝐬 ♻  

╭➢ 𝐎𝐰𝐧𝐞𝐫 : 𝐀 𝐑 𝐈 𝐉 𝐈 𝐓⚡  
╰➢ 𝐅𝐁 : https://fb.com/arijit016

╭➢ 🕒 {timeIND} (IN) 
╰➢ 🕒 {timeBD} (BD)`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const { threadID } = event;
				const { nickNameBot = "MyBot" } = global.GoatBot.config;
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(
						getLang("defaultWelcomeMessage").replace(/\{botName\}/g, nickNameBot)
					);
				}

				// if new member
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false) return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const threadName = threadData.threadName;
					const userName = [], mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1) multiple = true;

					for (const user of dataAddedParticipants) {
						userName.push(user.fullName);
						mentions.push({ tag: user.fullName, id: user.userFbId });
					}

					if (userName.length == 0) return;

					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

					// styled names
					const styledUser = toBoldUnicode(userName.join(", "));
					const styledThread = toBoldUnicode(threadName);

					// time for IND & BD
					const timeIND = moment.tz("Asia/Kolkata").format("hh:mm A");
					const timeBD  = moment.tz("Asia/Dhaka").format("hh:mm A");

					// session (based on IND time)
					const hourIND = parseInt(moment.tz("Asia/Kolkata").format("HH"));
					let sessionText = toBoldUnicode(getSession(hourIND));

					// replace placeholders
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}/g, styledUser)
						.replace(/\{boxName\}|\{threadName\}/g, styledThread)
						.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
						.replace(/\{session\}/g, sessionText)
						.replace(/\{timeIND\}/g, toBoldUnicode(timeIND))
						.replace(/\{timeBD\}/g, toBoldUnicode(timeBD));

					const form = { body: welcomeMessage, mentions };

					// Add attachments if set
					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.map(file => drive.getFile(file, "stream"));
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}

					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
