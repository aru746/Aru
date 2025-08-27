const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return base.data.api;
};

// You must define these functions somewhere or import them
const dipto = async (url, path) => {
  const { data } = await axios({ url, responseType: "arraybuffer" });
  fs.writeFileSync(path, data);
  return fs.createReadStream(path);
};

const diptoSt = async (url, filename) => {
  const { data } = await axios({ url, responseType: "arraybuffer" });
  fs.writeFileSync(filename, data);
  return fs.createReadStream(filename);
};

module.exports = {
  config: {
    name: "ytb",
    version: "1.1.4",
    aliases: ["youtube"],
    author: "nexo_here",
    countDown: 5,
    role: 0,
    description: {
      en: "Download video, audio, and info from YouTube",
    },
    category: "media",
    guide: {
      en:
        "  {pn} [video|-v] [<video name>|<video link>]: use to download video from YouTube." +
        "\n  {pn} [audio|-a] [<video name>|<video link>]: use to download audio from YouTube" +
        "\n  {pn} [info|-i] [<video name>|<video link>]: use to view video information from YouTube" +
        "\n  Example:" +
        "\n {pn} -v chipi chipi chapa chapa" +
        "\n {pn} -a chipi chipi chapa chapa" +
        "\n {pn} -i chipi chipi chapa chapa",
    },
  },

  onStart: async ({ api, args, event, commandName }) => {
    const action = args[0]?.toLowerCase();
    const baseURL = await baseApiUrl();

    const checkurl =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

    const urlYtb = checkurl.test(args[1]);
    let videoID;

    if (urlYtb) {
      const match = args[1].match(checkurl);
      videoID = match ? match[1] : null;

      if (action === "-v" || action === "-a") {
        try {
          const format = action === "-v" ? "mp4" : "mp3";
          const path = `ytb_${format}_${videoID}.${format}`;

          const { data } = await axios.get(
            `${baseURL}/ytDl3?link=${videoID}&format=${format}&quality=3`
          );
          const { title, downloadLink, quality } = data;

          await api.sendMessage(
            {
              body: `• Title: ${title}\n• Quality: ${quality}`,
              attachment: await dipto(downloadLink, path),
            },
            event.threadID,
            () => fs.unlinkSync(path),
            event.messageID
          );
        } catch (e) {
          console.error(e);
          return api.sendMessage(
            "❌ Failed to download the video/audio. Please try again later.",
            event.threadID,
            event.messageID
          );
        }
      }
    }

    args.shift();
    const keyWord = args.join(" ");
    const maxResults = 6;

    let result;
    try {
      result = (
        await axios.get(`${baseURL}/ytFullSearch?songName=${keyWord}`)
      ).data.slice(0, maxResults);
    } catch (err) {
      return api.sendMessage(
        "❌ An error occurred: " + err.message,
        event.threadID,
        event.messageID
      );
    }

    if (result.length === 0) {
      return api.sendMessage(
        "⭕ No search results match the keyword: " + keyWord,
        event.threadID,
        event.messageID
      );
    }

    let msg = "";
    const thumbnails = [];
    let i = 1;

    for (const info of result) {
      thumbnails.push(await diptoSt(info.thumbnail, `thumb_${i}.jpg`));
      msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
    }

    api.sendMessage(
      {
        body: msg + "Reply to this message with a number to choose",
        attachment: thumbnails,
      },
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          result,
          action,
        });
      },
      event.messageID
    );
  },

  onReply: async ({ event, api, Reply }) => {
    const { result, action } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice <= 0 || choice > result.length) {
      return api.sendMessage(
        "❌ Invalid choice. Please reply with a valid number.",
        event.threadID,
        event.messageID
      );
    }

    const selectedVideo = result[choice - 1];
    const videoID = selectedVideo.id;
    const baseURL = await baseApiUrl();

    if (["-v", "video", "mp4", "-a", "audio", "mp3", "music"].includes(action)) {
      try {
        let format = ["-a", "audio", "mp3", "music"].includes(action)
          ? "mp3"
          : "mp4";
        const path = `ytb_${format}_${videoID}.${format}`;

        const { data } = await axios.get(
          `${baseURL}/ytDl3?link=${videoID}&format=${format}&quality=4`
        );
        const { title, downloadLink, quality } = data;

        api.unsendMessage(Reply.messageID);
        await api.sendMessage(
          {
            body: `• Title: ${title}\n• Quality: ${quality}`,
            attachment: await dipto(downloadLink, path),
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );
      } catch (e) {
        console.error(e);
        return api.sendMessage(
          "❌ Failed to download the video/audio. Please try again later.",
          event.threadID,
          event.messageID
        );
      }
    }

    if (action === "-i" || action === "info") {
      try {
        const { data } = await axios.get(
          `${baseURL}/ytfullinfo?videoID=${videoID}`
        );
        api.unsendMessage(Reply.messageID);
        await api.sendMessage(
          {
            body: `✨ | Title: ${data.title}\n⏳ | Duration: ${
              data.duration / 60
            } minutes\nResolution: ${data.resolution}\n👀 | View Count: ${
              data.view_count
            }\n👍 | Likes: ${data.like_count}\n📬 | Comments: ${
              data.comment_count
            }\n🌐 | Channel: ${data.channel}\n🧍 | Uploader ID: ${
              data.uploader_id
            }\n👥 | Subscribers: ${data.channel_follower_count}`,
          },
          event.threadID,
          event.messageID
        );
      } catch (err) {
        console.error(err);
        return api.sendMessage(
          "❌ Failed to fetch video info.",
          event.threadID,
          event.messageID
        );
      }
    }
  },
};
