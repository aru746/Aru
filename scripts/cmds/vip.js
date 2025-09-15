const fs = require('fs').promises;
const path = require('path');
const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
    config: {
        name: "vip",
        version: "2.0",
        author: "Kshitiz + Upgraded by Arijit",
        countDown: 5,
        role: 0,
        shortDescription: { en: "Handle VIP members" },
        longDescription: { en: "Manage VIP members and their commands" },
        category: "admin",
        guide: {
            en: `{p}vip add <uid> <days> → Add VIP (0 = permanent)\n{p}vip remove <uid> → Remove VIP\n{p}vip list → Show VIP list\n{p}vip on/off → Enable/disable VIP mode\n{p}vip cmd → Show VIP command list`
        }
    },

    langs: {
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
            removeSuccess: "🗑️ 𝗠𝗲𝗺𝗯𝗲𝗿 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗩𝗜𝗣 𝗹𝗶𝘀𝘁!",
            notInVIP: "❌ 𝗠𝗲𝗺𝗯𝗲𝗿 𝗶𝘀 𝗻𝗼𝘁 𝗶𝗻 𝘁𝗵𝗲 𝗩𝗜𝗣 𝗹𝗶𝘀𝘁!",
            list: "👑 | 𝗩𝗶𝗽 𝗺𝗲𝗺𝗯𝗲𝗿𝘀 𝗹𝗶𝘀𝘁:\n%1",
            vipModeEnabled: "✅ 𝗩𝗜𝗣 𝗺𝗼𝗱𝗲 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗲𝗻𝗮𝗯𝗹𝗲𝗱",
            vipModeDisabled: "❌ 𝗩𝗜𝗣 𝗺𝗼𝗱𝗲 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱"
        }
    },

    onStart: async function ({ args, message, event, usersData, api, commandName, getLang }) {
        const vipDataPath = path.join(__dirname, 'vip.json');
        const { senderID, threadID } = event;

        // Only admin can manage VIPs
        if (!config.adminBot.includes(senderID) && ["add","remove","list","on","off","cmd","commands"].includes(args[0])) {
            return message.reply(getLang("noAdmin"));
        }

        // Enable/disable VIP mode
        if (args[0] === 'on') {
            config.whiteListMode.enable = true;
            await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
            return message.reply(getLang("vipModeEnabled"));
        }
        if (args[0] === 'off') {
            config.whiteListMode.enable = false;
            await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
            return message.reply(getLang("vipModeDisabled"));
        }

        // Add VIP
        if (args[0] === 'add' && args.length >= 3) {
            const userId = args[1];
            const days = parseInt(args[2]); // expiry days (0 = permanent)
            const vipData = await fs.readFile(vipDataPath).then(d => JSON.parse(d)).catch(() => ({}));
            if (!vipData.permission) vipData.permission = [];

            if (vipData.permission.find(v => v.id === userId))
                return message.reply(getLang("alreadyInVIP"));

            const userName = await usersData.getName(userId);
            let expireDate = "Permanent";
            if (days > 0) {
                const expire = new Date();
                expire.setDate(expire.getDate() + days);
                expireDate = expire.toLocaleDateString("en-GB"); // DD-MM-YYYY
            }

            vipData.permission.push({ id: userId, name: userName, expire: expireDate });
            await fs.writeFile(vipDataPath, JSON.stringify(vipData, null, 2));
            return message.reply(getLang("addSuccess"));
        }

        // Remove VIP
        if (args[0] === 'remove' && args.length === 2) {
            const userId = args[1];
            const vipData = await fs.readFile(vipDataPath).then(d => JSON.parse(d)).catch(() => ({}));
            if (!vipData.permission) vipData.permission = [];

            const index = vipData.permission.findIndex(v => v.id === userId);
            if (index === -1) return message.reply(getLang("notInVIP"));

            vipData.permission.splice(index, 1);
            await fs.writeFile(vipDataPath, JSON.stringify(vipData, null, 2));
            return message.reply(getLang("removeSuccess"));
        }

        // List VIPs
        if (args[0] === 'list') {
            const vipData = await fs.readFile(vipDataPath).then(d => JSON.parse(d)).catch(() => ({}));
            if (!vipData.permission || vipData.permission.length === 0)
                return message.reply("❌ No VIP users found.");

            let vipList = "👑 | 𝐋𝐢𝐬𝐭 𝐨𝐟 𝐕𝐈𝐏 𝐔𝐬𝐞𝐫𝐬:\n\n";
            vipData.permission.forEach(v => {
                vipList += `╭‣ ${v.name}\n╰‣ 𝐄𝐱𝐩𝐢𝐫𝐞𝐬: ${v.expire}\n\n`;
            });
            return message.reply(vipList.trim());
        }

        // VIP commands list
        if (args[0] === 'cmd' || args[0] === 'commands') {
            const vipCmds = ["𝐰𝐥𝐭", "𝐞𝐝𝐢𝐭2", "𝐠𝐚𝐲", "𝐦j"];
            let msg = "🎀 | 𝐕𝐈𝐏 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭:\n";
            vipCmds.forEach((cmd, i) => msg += `${i + 1}.  ${cmd}\n`);
            msg += `\n> 𝐌𝐨𝐫𝐞 𝐕𝐈𝐏 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐜𝐨𝐦𝐢𝐧𝐠 𝐬𝐨𝐨𝐧!`;
            return message.reply(msg);
        }

        // Messaging feature for VIPs (unchanged from your code)
        const vipData = await fs.readFile(vipDataPath).then(d => JSON.parse(d)).catch(() => ({}));
        if (!vipData.permission || !vipData.permission.find(v => v.id === senderID)) {
            return message.reply(getLang("missingMessage"));
        }
        if (!args[0]) return message.reply(getLang("missingMessage"));

        const senderName = await usersData.getName(senderID);
        const msgBody = "==📨️ VIP MESSAGE 📨️=="
            + `\n- User Name: ${senderName}`
            + `\n- User ID: ${senderID}`;

        const formMessage = {
            body: msgBody + getLang("content", args.join(" ")),
            mentions: [{ id: senderID, tag: senderName }],
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

        switch (type) {
            case "userCallAdmin": {
                const formMessage = {
                    body: getLang("reply", senderName, args.join(" ")),
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };
                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (!err) {
                        message.reply(getLang("replyUserSuccess"));
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName,
                            messageID: info.messageID,
                            messageIDSender: event.messageID,
                            threadID: event.threadID,
                            type: "adminReply"
                        });
                    }
                }, messageIDSender);
                break;
            }
            case "adminReply": {
                const { isGroup } = event;
                let sendByGroup = "";
                if (isGroup) {
                    const { threadName } = await api.getThreadInfo(event.threadID);
                    sendByGroup = getLang("sendByGroup", threadName, event.threadID);
                }
                const formMessage = {
                    body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };
                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (!err) {
                        message.reply(getLang("replySuccess"));
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName,
                            messageID: info.messageID,
                            messageIDSender: event.messageID,
                            threadID: event.threadID,
                            type: "userCallAdmin"
                        });
                    }
                }, messageIDSender);
                break;
            }
        }
    }
};
