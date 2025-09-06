const { removeHomeDir, log } = global.utils;

module.exports = {
  config: {
    name: "eval",
    version: "2.1",
    author: "NTKhang",
    countDown: 5,
    role: 2,
    description: {
      vi: "Test code nhanh",
      en: "Test code quickly"
    },
    category: "owner",
    guide: {
      vi: "{pn} <đoạn code cần test>",
      en: "{pn} <code to test>"
    }
  },

  langs: {
    vi: {
      error: "❌ Đã có lỗi xảy ra:",
      noPerm: "❌ | 𝐬𝐨𝐫𝐫𝐲 𝐛𝐚𝐛𝐲, 𝐨𝐧𝐥𝐲 𝐦𝐲 𝐥𝐨𝐫𝐝 𝐀𝐫𝐮 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝"
    },
    en: {
      error: "❌ An error occurred:",
      noPerm: "❌ | 𝐬𝐨𝐫𝐫𝐲 𝐛𝐚𝐛𝐲, 𝐨𝐧𝐥𝐲 𝐦𝐲 𝐥𝐨𝐫𝐝 𝐀𝐫𝐮 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝"
    }
  },

  onStart: async function ({ args, message, event, getLang }) {
    const ownerUID = "100069254151118"; // Arijit's Facebook UID

    if (event.senderID !== ownerUID) {
      return message.reply(getLang("noPerm"));
    }

    function output(msg) {
      if (typeof msg === "number" || typeof msg === "boolean" || typeof msg === "function") {
        msg = msg.toString();
      }
      else if (msg instanceof Map) {
        let text = `Map(${msg.size}) `;
        text += JSON.stringify(mapToObj(msg), null, 2);
        msg = text;
      }
      else if (typeof msg === "object" && msg !== null) {
        try {
          msg = JSON.stringify(msg, null, 2);
        } catch {
          msg = String(msg);
        }
      }
      else if (typeof msg === "undefined") {
        msg = "undefined";
      }

      message.reply(msg);
    }

    function out(msg) {
      output(msg);
    }

    function mapToObj(map) {
      const obj = {};
      map.forEach((v, k) => {
        obj[k] = v;
      });
      return obj;
    }

    const code = args.join(" ");
    if (!code) {
      return message.reply("⚠️ Please provide some code to evaluate!");
    }

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const func = new AsyncFunction("message", "event", "args", "output", "out", "log", "removeHomeDir", "mapToObj", code);

      await func(message, event, args, output, out, log, removeHomeDir, mapToObj);
    } catch (err) {
      log.err("eval command", err);
      message.reply(
        `${getLang("error")}\n` +
        (err?.stack
          ? removeHomeDir(err.stack)
          : removeHomeDir(JSON.stringify(err, null, 2) || String(err))
        )
      );
    }
  }
};
