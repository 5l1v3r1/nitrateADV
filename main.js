const { default: { get } } = require('axios'),
    chalk = require("chalk"),
    { Client } = require('discord.js'),
    fs = require('fs'),
    Logger = require("@ayana/logger"),
    { redeem, add, remove } = require("./Functions")

require("./CustomLogger");
this.logger = Logger.get("Nitro")


let tokens = fs.readFileSync("src/tokens.txt", "utf8").replace(/\r/, "").split('\n');

let config = JSON.parse(fs.readFileSync("src/config.json", "utf8"))

let count = 0;

let repeated = [];

for (token of tokens) {

    const bot = new Client()

    bot.on("ready", () => {
        console.log(`Logged in as: ${chalk.yellow(bot.user.tag)}\nEmail: ${chalk.bold(bot.user.email)}\nID: ${chalk.bold(bot.user.id)}`);
        process.title = `${bot.user.tag} | ${bot.guilds.size} guilds | ${bot.user.friends.size} friends`;

    });


    bot.on("message", async (message) => {

        try {

            if (message.channel.type === "dm" || message.channel.type === "group") return;
            let code;

            // console.log((message.content.search("https://discord.gift/")));

            if (!(message.content.includes("https://d iscord.gift/") || message.content.includes("https://discordapp.com/gifts/"))) return;


            if (message.content.includes("https://discord.gift/")) {
                code = message.content.split("https://discord.gift/").pop().replace(/\s+/g, " ").split(' ')[0];

                if (repeated.includes(code)) {
                    this.logger.info(`${code} - Already attempted`, null, { invalid: true, ...message });
                    return;
                }

                let res = await get("https://discordapp.com/api/v6/entitlements/gift-codes/" + code + "?with_application=true&with_subscription_plan=true").catch(O_o => { })

                if (!res || res.status == 404 || res.status == "404" || res.data === "Unkown Gift Code") {
                    return this.logger.info(`${code}`, null, { invalid: true, ...message });
                }

                console.log(1)

                redeem(code, message)

                repeated.push(code);
                return;
            };


            if (message.content.includes("https://discordapp.com/gifts")) {
                code = message.content.split("https://discordapp.com/gifts/").pop().replace(/\s+/g, " ").split(' ')[0];

                if (repeated.includes(code)) {
                    this.logger.info(`${code} - Already attempted`, null, { invalid: true, ...message })
                    return;
                }

                let res = await get("https://discordapp.com/api/v6/entitlements/gift-codes/" + code + "?with_application=true&with_subscription_plan=true").catch(O_o => { })

                if (!res || res.status == 404 || res.status == "404" || res.data === "Unkown Gift Code") {
                    return this.logger.info(`${code}`, null, { invalid: true, ...message });
                }

                console.log(1)

                redeem(code, message)


                repeated.push(code);
            }
            count += 1;
            if (count == 1) {
                process.title = `${message.client.user.tag} | ${message.client.guilds.size} guilds | ${message.client.user.friends.size} friends | ${count.toString()} gift`
            }
            else if (count > 1) {
                process.title = `${message.client.user.tag} | ${message.client.guilds.size} guilds | ${message.client.user.friends.size} friends | ${count.toString()} gifts`
            }
        } catch (e) {
            console.log(e)

        }


    })

    // login witth the scouts
    bot.login(token).catch(function (error) {
        continue;
        console.log(error.message);
    });



}


