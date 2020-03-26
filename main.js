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

    console.log(token)

    const bot = new Client();
    bot.on("ready", () => {
        console.log(`Logged in as: ${chalk.yellow(bot.user.tag)}\nEmail: ${chalk.bold(bot.user.email)}\nID: ${chalk.bold(bot.user.id)}\n\n`);
        process.title = `${bot.user.tag} | ${bot.guilds.size} guilds | ${bot.user.friends.size} friends`;
    });
    bot.on("message", async (message) => {
        try {

            blackListedInvites = fs.readFileSync("./blacklistedInvites.txt", 'utf8').replace(/\r/, "").split('\n');


            if ( config.joinServers ) {
                let invites = message.content.match(/(discord.gg|discordapp.com\/invites)\/\w+/gi);
                if ( invites === [] ) {
                    return;
                };

                for ( let urls of invites ) {
                    let code; 
                    if ( urls.includes('invites') ) {
                        code = urls.split('invites')[1]
                    } else {
                        code = urls.split('/')[1]
                    }

                    if (blackListedInvites.filter(s => s.includes(code))) return;

                    fs.appendFileSync('blacklistedInvites.txt', `\n${urls}`, 'utf8');

                    _data = await post(`https://discordapp.com/api/v6/invites/${code}`, {}, {
                        headers: {
                            "Authorization": message.client.token,
                            "user-agent": "Mozilla/5.0"
                        }
                    }).catch(O_o=>{});

                    console.log(chalk.keyword('orange') +  ` Joined a new server: ${_data['guild']['name']}` )
                }
            }
            if ( message.channel.type === "dm" || message.channel.type === "group" ) return;

            if ( !(message.content.includes("discord.gift/") || message.content.includes("discordapp.com/gifts/")) ) return;

            let codes = message.content.match( /(discord.gift|discordapp.com\/gifts)\/[a-zA-Z0-9]{16,24}/g );

            if ( codes === [] ) {
                return;
            }

            for ( let gift of codes ) {
                let giftCode = gift.split("/")[1];
                if ( repeatedCodes.includes(giftCode) ) {
                    console.log(chalk.redBright("INVALID") + ` ${code} - Already attempted`)
                    return;
                };

                repeatedCodes.push( giftCode );
                count += 1;
                process.title = `${message.client.user.tag} | ${message.client.guilds.size} guilds | ${message.client.user.friends.size} friends | ${count.toString()} gift(s)`
            
                await redeem( giftCode, message );

            }
        } catch ( e ) {
            ''
        }
    });

    try {
        bot.login(token)
    } catch (err) {
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
        }).catch( _error => {
            if ( _error.response.status == 404 || _error.response.data['message'] == "Unkown Gift Code" ) {
                return console.log(chalk.redBright("INVALID") + ` ${code} - Invalid Code`);
            }
            return;
        });

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
