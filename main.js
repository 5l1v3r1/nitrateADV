const { default: { post } } = require('axios'),
    chalk = require("chalk"),
    { Client } = require('discord.js'),
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync("./config.json", "utf8"))

let tokens = fs.readFileSync("./tokens.txt", "utf8").replace(/\r/g, "").split('\n');
let count = 0;
let repeatedCodes = [];
let title = ' Fweak | Nitro Auto Claimer (og: Giggl3z/Nitrate)';

function start() {
    for (token of tokens) {
        const bot = new Client();

        bot.on("ready", () => {
            console.log(`Logged in as: ${chalk.yellow(bot.user.tag)}\nEmail: ${chalk.bold(bot.user.email)}\nID: ${chalk.bold(bot.user.id)}\n\n`);
            process.title = title;
        });

    bot.on("message", async (message) => {

        blackListedInvites = fs.readFileSync("blacklistedInvites.txt", 'utf8').split('\n');

        if (config.joinServers == true) {

            let invites = message.content.match(/(discord.gg|discordapp.com\/invites)\/\w+/gi);

                if (invites && invites !== null && typeof invites[0] !== "null") {

                    invites.forEach((invite, i) => {

                        setTimeout(async () => {

                            let code;

                            if (invite.includes('invites')) {
                                code = invite.split('invites')[1]
                            } else {
                                code = invite.split('/')[1]
                            }

                            if (typeof blackListedInvites.filter(s => s.includes(code))[0] !== "undefined") return;

                            fs.appendFileSync('blacklistedInvites.txt', `${invite}\n`, 'utf8');
                            _data = await post(`https://discordapp.com/api/v6/invites/${code}`, {}, {
                                headers: {
                                    "Authorization": message.client.token,
                                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
                                }
                            }).catch(() => { });

                            if (typeof _data === "undefined" || _data.data['message'] === "Unkown Invite") {
                                console.log(chalk.red("COULDN'T JOIN INVITE") + ` URL: ${invite}`)
                                return;
                            };

                            console.log(`Joined a new server: ` + chalk.green(`${_data.data['guild']['name']}`))
                        }, i * 5000);
                    })
                }
            }


            if (codes === null || !codes[0] || typeof codes[0] == "null") return;

            let giftCode;

            if (codes[0].includes("discordapp.com/gifts/")) {
                giftCode = codes[0].split('/')[2]
            } else {
                giftCode = codes[0].split("/")[1];
            }

        let codes = message.content.match(/(discord.gift|discordapp.com\/gifts)\/\w{16,24}/);

        if ( codes === null || !codes[0] || typeof codes[0] == "null" ) return;

            repeatedCodes.push(giftCode);
            count += 1;
            process.title = title + ` | ${count.toString()} gift(s)`

            await redeem(giftCode, message);

        });

        bot.login(token)
            .catch(err => {
                if (err && error.message === "Incorrect login details were provided.") {
                tokens = tokens.filter(s => s !== token);
                return start()
                }
            }).catch(O_o=>{})


    }
}
start()
let data = { "channel_id": null, "payment_source_id": null };

async function redeem(code, message) {
    let _data = await post('https://discordapp.com/api/v6/entitlements/gift-codes/' + code + '/redeem', data, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36",
            "Content-Type": "application/json",
            'Authorization': config.token
        },
        time: true
    }).catch(() => { });

    if (typeof _data === "undefined") {
        return console.log(chalk.redBright("INVALID") + ` ${code} - Invalid Code`);
    }

    var responseTime = new Date() - start;
    console.log(chalk.green("CLAIMED") + ` ${code} = ${message.channel.name} | (${responseTime / 1000}s)`);
}
