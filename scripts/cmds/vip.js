const fs = require('fs').promises;
const path = require('path');
const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
    config: {
        name: "vip",
        version: "1.0",
        author: "Kshitiz",
        countDown: 5,
        role: 0,
        shortDescription: {
            vi: "",
            en: "handle vip members"
        },
        longDescription: {
            vi: "",
            en: "handle vip members"
        },
        category: "admin",
        guide: {
            vi: "",
            en: "{p} vip <message> to sent msg to vip user\n{p} vip add {uid} \n {p} vip remove {uid} \n {p} vip list"
        }
    },

    langs: {
        vi: {

        },
        en: {
            missingMessage: "❌ 𝘆𝗼𝘂 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗯𝗲 𝘃𝗶𝗽 𝗺𝗲𝗺𝗯𝗲𝗿 𝘁𝗼 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗳𝗲𝗮𝘁𝘂𝗿𝗲.",
            sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
            sendByUser: "\n- Sent from user",
            content: "\n\n𝗖𝗼𝗻𝘁𝗲𝗻𝘁:%1\nReply this message to send message",
            success: "✅ 𝗦𝗲𝗻𝘁 𝘆𝗼𝘂𝗿 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘁𝗼 𝗩𝗜𝗣 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!\n%2",
            failed: "⭕ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝘀𝗲𝗻𝗱𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘁𝗼 𝗩𝗜𝗣\n%2\nCheck console for more details",
            reply: "📍 𝗥𝗲𝗽𝗹𝘆 𝗳𝗿𝗼𝗺 𝗩𝗜𝗣 %1:\n%2",
            replySuccess: "✅ 𝗦𝗲𝗻𝘁 𝘆𝗼𝘂𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗩𝗜𝗣 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!",
            feedback: "📝 𝗙𝗲𝗲𝗱𝗯𝗮𝗰𝗸 𝗳𝗿𝗼𝗺 𝗩𝗜𝗣 𝘂𝘀𝗲𝗿 %1:\n- User ID: %2\n%3\n\n𝗖𝗼𝗻𝘁𝗲𝗻𝘁:%4",
            replyUserSuccess: "✅ 𝗦𝗲𝗻𝘁 𝘆𝗼𝘂𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗩𝗜𝗣 𝘂𝘀𝗲𝗿 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!",
            noAdmin: "🚫 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗽𝗲𝗿𝗳𝗼𝗿𝗺 𝘁𝗵𝗶𝘀 𝗮𝗰𝘁𝗶𝗼𝗻.",
            addSuccess: "✅ 𝗠𝗲𝗺𝗯𝗲𝗿 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗮𝗱𝗱𝗲𝗱 𝘁𝗼 𝘁𝗵𝗲 𝗩𝗜𝗣 𝗹𝗶𝘀𝘁!",
            alreadyInVIP: "🏅 𝗠𝗲𝗺𝗯𝗲𝗿 𝗶𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗶𝗻 𝘁𝗵𝗲 𝗩𝗜𝗣 𝗹𝗶𝘀𝘁!",
            removeSuccess: "𝗠𝗲𝗺𝗯𝗲𝗿 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗩𝗜𝗣 𝗹𝗶𝘀𝘁!",
            notInVIP: "❌ 𝗠𝗲𝗺𝗯𝗲𝗿 𝗶𝘀 𝗻𝗼𝘁 𝗶𝗻 𝘁𝗵𝗲 𝗩𝗜𝗣 𝗹𝗶𝘀𝘁!",
            list: "👑 | 𝗩𝗶𝗽 𝗺𝗲𝗺𝗯𝗲𝗿𝘀 𝗹𝗶𝘀𝘁:\n%1",
            vipModeEnabled: "✅ 𝗩𝗶𝗽 𝗺𝗼𝗱𝗲 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗲𝗻𝗮𝗯𝗹𝗲𝗱",
            vipModeDisabled: "❌ 𝗩𝗶𝗽 𝗺𝗼𝗱𝗲 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱"
        }
    },

    onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
        const vipDataPath = path.join(__dirname, 'vip.json'); 
        const { senderID, threadID, isGroup } = event;

        if (!config.adminBot.includes(senderID)) {
            return message.reply(getLang("noAdmin"));
        }

        if (args[0] === 'on') {
            try {
                config.whiteListMode.enable = true;
                const vipData = await fs.readFile(vipDataPath).then(data => JSON.parse(data)).catch(() => ({}));
                if (!vipData.permission) {
                    vipData.permission = [];
                }
                config.whiteListMode.whiteListIds = vipData.permission; 
                await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
                return message.reply(getLang("vipModeEnabled"));
            } catch (error) {
                console.error("Error enabling VIP mode:", error);
                return message.reply("An error occurred while enabling VIP mode.");
            }
        } else if (args[0] === 'off') {
            try {
                config.whiteListMode.enable = false;
                await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
                return message.reply(getLang("vipModeDisabled"));
            } catch (error) {
                console.error("Error disabling VIP mode:", error);
                return message.reply("An error occurred while disabling VIP mode.");
            }
        }

        
        if (args[0] === 'add' && args.length === 2) {
            const userId = args[1];
            const vipData = await fs.readFile(vipDataPath).then(data => JSON.parse(data)).catch(() => ({}));
            if (!vipData.permission) {
                vipData.permission = [];
            }
            if (!vipData.permission.includes(userId)) {
                vipData.permission.push(userId);
                await fs.writeFile(vipDataPath, JSON.stringify(vipData, null, 2));
                return message.reply(getLang("addSuccess"));
            } else {
                return message.reply(getLang("alreadyInVIP"));
            }
        } else if (args[0] === 'remove' && args.length === 2) {
            const userId = args[1];
            const vipData = await fs.readFile(vipDataPath).then(data => JSON.parse(data)).catch(() => ({}));
            if (!vipData.permission) {
                vipData.permission = [];
            }
            if (vipData.permission.includes(userId)) {
                vipData.permission = vipData.permission.filter(id => id !== userId);
                await fs.writeFile(vipDataPath, JSON.stringify(vipData, null, 2));
                return message.reply(getLang("removeSuccess"));
            } else {
                return message.reply(getLang("notInVIP"));
            }
        } else if (args[0] === 'list') {
            const vipData = await fs.readFile(vipDataPath).then(data => JSON.parse(data)).catch(() => ({}));
            const vipList = vipData.permission ? await Promise.all(vipData.permission.map(async id => {
                const name = await usersData.getName(id);
                return `${id}-(${name})`;
            })) : '';
            return message.reply(getLang("list", vipList.join('\n') || ''));
        } else if (!config.whiteListMode.enable) {
          
            return message.reply("Turn on Vip mode to send msg to vip members.");
        }

     
        const vipData = await fs.readFile(vipDataPath).then(data => JSON.parse(data)).catch(() => ({}));
        if (!vipData.permission || !vipData.permission.includes(senderID)) {
            return message.reply(getLang("missingMessage"));
        }

        if (!args[0]) {
            return message.reply(getLang("missingMessage"));
        }

        const senderName = await usersData.getName(senderID);
        const msg = "==📨️ VIP MESSAGE 📨️=="
            + `\n- User Name: ${senderName}`
            + `\n- User ID: ${senderID}`

        const formMessage = {
            body: msg + getLang("content", args.join(" ")),
            mentions: [{
                id: senderID,
                tag: senderName
            }],
            attachment: await getStreamsFromAttachment(
                [...event.attachments, ...(event.messageReply?.attachments || [])]
                    .filter(item => mediaTypes.includes(item.type))
            )
        };

        try {
            const messageSend = await api.sendMessage(formMessage, threadID);
            global.GoatBot.onReply.set(messageSend.messageID, {
                commandName,
                messageID: messageSend.messageID,
                threadID,
                messageIDSender: event.messageID,
                type: "userCallAdmin"
            });
        } catch (error) {
            console.error("Error sending message to VIP:", error);
            return message.reply(getLang("failed"));
        }
    },
    onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
        const { type, threadID, messageIDSender } = Reply;
        const senderName = await usersData.getName(event.senderID);
        const { isGroup } = event;

        switch (type) {
            case "userCallAdmin": {
                const formMessage = {
                    body: getLang("reply", senderName, args.join(" ")),
                    mentions: [{
                        id: event.senderID,
                        tag: senderName
                    }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };

                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (err)
                        return message.err(err);
                    message.reply(getLang("replyUserSuccess"));
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        messageIDSender: event.messageID,
                        threadID: event.threadID,
                        type: "adminReply"
                    });
                }, messageIDSender);
                break;
            }
            case "adminReply": {
                let sendByGroup = "";
                if (isGroup) {
                    const { threadName } = await api.getThreadInfo(event.threadID);
                    sendByGroup = getLang("sendByGroup", threadName, event.threadID);
                }
                const formMessage = {
                    body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
                    mentions: [{
                        id: event.senderID,
                        tag: senderName
                    }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };

                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (err)
                        return message.err(err);
                    message.reply(getLang("replySuccess"));
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        messageIDSender: event.messageID,
                        threadID: event.threadID,
                        type: "userCallAdmin"
                    });
                }, messageIDSender);
                break;
            }
            default: {
                break;
            }
        }
    }
};
