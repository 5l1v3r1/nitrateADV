const { default: { post } } = require('axios'),
    chalk = require("chalk"),
    { Client } = require('discord.js'),
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync("./config.json", "utf8")),
    notifier = require("node-notifier");

let tokens = fs.readFileSync("./tokens.txt", "utf8").replace(/\r/, "").split('\n');
let count = 0;
let repeatedCodes = [];

for (token of tokens) {
    const bot = new Client();

    bot.on("ready", () => {
        console.log(`Logged in as: ${chalk.yellow(bot.user.tag)}\nEmail: ${chalk.bold(bot.user.email)}\nID: ${chalk.bold(bot.user.id)}\n\n`);
        process.title = `${bot.user.tag} | ${bot.guilds.size} guilds | ${bot.user.friends.size} friends`;
    });

    bot.on("message", async (message) => {
        try{ 

            if ( config.joinServers === true ) {

                blackListedInvites = fs.readFileSync("blacklistedInvites.txt", 'utf8').split('\n');

                let invites = message.content.match(/(discord.gg|discordapp.com\/invites)\/\w+/gi);

                if ( invites === null || !invites[0] || typeof invites[0] == "null" ) return;

                for ( let url of invites ) {

                    let code; 
                    if ( url.includes('invites') ) {
                        code = url.split('invites')[1]
                    } else {
                        code = url.split('/')[1]
                    }

                    if (typeof blackListedInvites.filter(s => s.includes(code))[0] !== "undefined") return;

                    fs.appendFileSync('blacklistedInvites.txt', `\n${url}`, 'utf8');

                    setTimeout( async () => {

                    _data = await post(`https://discordapp.com/api/v6/invites/${code}`, {}, {
                        headers: {
                            "Authorization": message.client.token,
                            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
                        }
                    }).catch(() => {});

                    if ( typeof _data === "undefined" ){
                    console.log(chalk.red("COULDN'T JOIN INVITE") + " Seems the account is disabled. " + chalk.green(`\nTOKEN: `) + `${message.client.token}\n`)
                    return; 
                    };
                    
                    if ( _data.data['message'] === "Unknown Invite") return;

                    console.log(` Joined a new server: ` + chalk.green(`${_data.data['guild']['name']}` ))

                }, 5000);

                }
                return;

            };  


            let codes = message.content.match(/(discord.gift|discordapp.com\/gifts)\/\w{16,24}/);

            if ( codes === null || !codes[0] || typeof codes[0] == "null" ) return;

            let giftCode;
            
            if (codes[0].includes("discordapp.com/gifts/")) {
                giftCode = codes[0].split('/')[2]
            } else {
                giftCode = codes[0].split("/")[1];
            }


            if (repeatedCodes.includes(giftCode)) {
                console.log(chalk.red("INVALID") + ` ${giftCode} - Already attempted`)
                return;
            };

            repeatedCodes.push(giftCode);
            count += 1;
            process.title = `${message.client.user.tag} | ${message.client.guilds.size} guilds | ${message.client.user.friends.size} friends | ${count.toString()} gift(s)`
        
            await redeem(giftCode, message);

        } catch (err) {
            console.error(err)
        }

    });

    try {
        bot.login(token)
    } catch (err) {
        '';
        continue;
    }
}

let data = {"channel_id": null, "payment_source_id": null};
async function redeem ( code, message ) {
        let _data = await post('https://discordapp.com/api/v6/entitlements/gift-codes/' + code + '/redeem', data, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36",
                "Content-Type": "application/json",
                'Authorization': config.token
            },
            time: true
        }).catch(() => {});

        if ( typeof _data === "undefined") {
            return console.log(chalk.redBright("INVALID") + ` ${code} - Invalid Code`);
        }

        var result = JSON.parse( _data.data );
        var responseTime = new Date() - start;
        console.log( chalk.green("VALID") + ` ${result.message} (${responseTime / 1000}s)` );
        notifier.notify({
            title: 'Nitrate',
            icon: 'nitro-png-2.png',
            appID: `${message.guild.name} | #${message.channel.name} | ${message.author.tag}`,
            message: result.message,
            timeout: 0.1
        });
    }
