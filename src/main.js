const { default: { post } } = require('axios'),
    chalk = require("chalk"),
    { Client } = require('discord.js'),
    fs = require('fs'),
    config = require("./config.json");

let tokens = fs.readFileSync("./tokens.txt", "utf8").replace(/\r/g, "").split('\n');
let count = 0;
let title = ' Fweak | Nitro Auto Claimer (og: Giggl3z/Nitrate)';

function codesList() {
    return fs.readFileSync("./Storage/codes.txt", "utf8").replace(/\r/g, "").split("\n");
}

function start() {
    process.title = title;

    for (token of tokens) {
        const bot = new Client();

        bot.on("ready", () => console.log(`Logged in as: ${chalk.yellow(bot.user.tag)}\nEmail: ${chalk.bold(bot.user.email)}\nID: ${chalk.bold(bot.user.id)}\n\n`));

        bot.on("message", async (message) => {
            let codes = message.content.match(/(discord.gift|discordapp.com\/gifts)\/\w{16,24}/);

            if (codes === null || !codes[0] || typeof codes[0] == "null") return;

            let startTimer = new Date();

            let code = codes[0].includes("discordapp.com/gifts/") ? codes[0].split("discordapp.com/gifts/")[1] : codes[0].split("/")[1];

            if (codesList().includes(code.trim()) === true) return;

            count += 1;
            process.title = title + ` | ${count.toString()} gift(s)`;
            fs.appendFileSync("./Storage/codes.txt", code.trim() + "\n", { encoding: "utf8" });
            await redeem(code, message, startTimer);
        });

        bot.login(token)
            .catch(err => {
                if (err && err.message === "Incorrect login details were provided.") {
                    tokens = tokens.filter(s => s !== token);
                    return start()
                } else {
                    console.log(err.message)
                }
            });
    }
}

start()

async function redeem(code, message, start) {
    let _data = await post(`https://discordapp.com/api/v6/entitlements/gift-codes/${code}/redeem`, { "channel_id": null, "payment_source_id": null }, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36",
            "Content-Type": "application/json",
            'Authorization': config.token
        }
    }).catch(() => { });

    if (typeof _data === "undefined") return console.log(chalk.redBright("INVALID") + ` ${code} - Invalid Code : .${(new Date() - start)}ms`);

    console.log(chalk.green("CLAIMED") + ` ${code} = ${message.channel.name} : .${(new Date() - start)}ms`);
}
