module.exports = {
  config: {
    name: "mathquiz",
    aliases: ["mq"],
    version: "4.0",
    author: "starboy",
    countDown: 30,
    role: 0,
    shortDescription: "Solve easy or medium level math quiz",
    longDescription: "Bot gives a random math problem (easy/medium) to solve and rewards coins for correct answers",
    category: "game",
  },

  users: {},

  easyQuestions: [
    { q: "5 + 3", ans: 8 },
    { q: "7 - 2", ans: 5 },
    { q: "6 + 9", ans: 15 },
    { q: "10 - 4", ans: 6 },
    { q: "12 + 5", ans: 17 },
    { q: "15 - 7", ans: 8 },
    { q: "8 + 6", ans: 14 },
    { q: "9 - 3", ans: 6 },
    { q: "4 + 11", ans: 15 },
    { q: "14 - 5", ans: 9 },
    { q: "7 + 7", ans: 14 },
    { q: "13 - 6", ans: 7 },
    { q: "2 + 19", ans: 21 },
    { q: "20 - 8", ans: 12 },
    { q: "5 + 16", ans: 21 },
    { q: "18 - 9", ans: 9 },
    { q: "11 + 4", ans: 15 },
    { q: "17 - 3", ans: 14 },
    { q: "6 + 12", ans: 18 },
    { q: "15 - 5", ans: 10 },
    { q: "9 + 8", ans: 17 },
    { q: "13 - 7", ans: 6 },
    { q: "3 + 14", ans: 17 },
    { q: "16 - 8", ans: 8 },
    { q: "10 + 5", ans: 15 },
    { q: "12 - 4", ans: 8 },
    { q: "7 + 13", ans: 20 },
    { q: "18 - 6", ans: 12 },
    { q: "6 + 15", ans: 21 },
    { q: "14 - 9", ans: 5 },
    { q: "8 + 11", ans: 19 },
    { q: "17 - 8", ans: 9 },
    { q: "5 + 18", ans: 23 },
    { q: "19 - 10", ans: 9 },
    { q: "9 + 12", ans: 21 },
    { q: "16 - 7", ans: 9 },
    { q: "7 + 10", ans: 17 },
    { q: "15 - 6", ans: 9 },
    { q: "11 + 9", ans: 20 },
    { q: "13 - 5", ans: 8 },
    { q: "6 + 14", ans: 20 },
    { q: "12 - 3", ans: 9 },
    { q: "8 + 9", ans: 17 },
    { q: "10 - 2", ans: 8 },
    { q: "7 + 12", ans: 19 },
    { q: "15 - 7", ans: 8 },
    { q: "9 + 6", ans: 15 },
    { q: "14 - 4", ans: 10 },
    { q: "5 + 13", ans: 18 },
    { q: "16 - 9", ans: 7 },
    { q: "8 + 7", ans: 15 },
    { q: "12 - 5", ans: 7 },
    { q: "6 + 18", ans: 24 },
    { q: "17 - 6", ans: 11 }
  ],

  getProblem(level) {
    if (level === "easy") {
      return this.easyQuestions[Math.floor(Math.random() * this.easyQuestions.length)];
    } else { // medium
      const num1 = Math.floor(Math.random() * 100) + 10; 
      const num2 = Math.floor(Math.random() * 50) + 5;   
      const num3 = Math.floor(Math.random() * 30) + 1;   

      const problems = [
        { q: `${num1} + ${num2} - ${num3}`, ans: num1 + num2 - num3 },
        { q: `${num1} - ${num2} + ${num3}`, ans: num1 - num2 + num3 },
        { q: `${num1} + ${num2} + ${num3}`, ans: num1 + num2 + num3 },
        { q: `${num1} - ${num2} - ${num3}`, ans: num1 - num2 - num3 },
        { q: `${num1} * ${num2} - ${num3}`, ans: num1 * num2 - num3 },
        { q: `${num1} * ${num2} + ${num3}`, ans: num1 * num2 + num3 },
        { q: `(${num1} + ${num2}) * ${num3}`, ans: (num1 + num2) * num3 },
        { q: `(${num1} - ${num2}) * ${num3}`, ans: (num1 - num2) * num3 },
        { q: `${num1} / ${num3} + ${num2}`, ans: parseFloat((num1 / num3 + num2).toFixed(2)) },
        { q: `${num1} / ${num3} - ${num2}`, ans: parseFloat((num1 / num3 - num2).toFixed(2)) }
      ];

      return problems[Math.floor(Math.random() * problems.length)];
    }
  },

  onStart: async function ({ message, event, args, commandName }) {
    const level = (args[0] || "easy").toLowerCase();
    if (!["easy", "medium"].includes(level)) {
      return message.reply("❌ Invalid level! Use 'easy' or 'medium'. Example: !mq easy");
    }

    const problem = this.getProblem(level);
    const coins = level === "easy" ? 100 : 300;

    const question = `🧮 ${level.charAt(0).toUpperCase() + level.slice(1)} Math Quiz:\n${problem.q} = ?\n\nReply with your answer!\n💰 Reward: ${coins} coins`;

    message.reply(question, (err, info) => {
      if (err) return console.error("Failed to send quiz:", err);

      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        correctAnswer: problem.ans,
        author: event.senderID,
        coins,
      });
    });
  },

  onReply: async function ({ message, Reply, event }) {
    if (event.senderID !== Reply.author) return;

    const userAnswer = parseFloat(event.body.trim());
    if (isNaN(userAnswer)) return message.reply("❌ Please enter a valid number.");

    if (!this.users[event.senderID]) this.users[event.senderID] = { balance: 0 };

    if (Math.abs(userAnswer - Reply.correctAnswer) < 0.01) {
      this.users[event.senderID].balance += Reply.coins;
      message.reply(`✅ Correct! 🎉 The answer was ${Reply.correctAnswer}\n💰 You earned ${Reply.coins} coins! Total: ${this.users[event.senderID].balance}`);
    } else {
      message.reply(`❌ Wrong! The correct answer was ${Reply.correctAnswer}\n💰 Your total coins: ${this.users[event.senderID].balance}`);
    }

    global.GoatBot.onReply.delete(Reply.messageID);
  },

  onMessage: async function ({ message, event }) {
    const text = (event.body || "").trim().toLowerCase();
    if (text === "mq balance" || text === "mathquiz balance") {
      const balance = this.users[event.senderID]?.balance || 0;
      message.reply(`💰 Your current balance is: ${balance} coins.`);
    }
  }
};
