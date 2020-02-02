const fs = require("fs");
const { default: { post } } = require('axios');
const notifier = require("node-notifier")
let config = JSON.parse(fs.readFileSync("src/config.json", "utf8"))


module.exports = {

    redeem: function (code, msg) {
        post('https://discordapp.com/api/v6/entitlements/gift-codes/' + code + '/redeem', {}, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36",
                "Content-Type": "application/json",
                'Authorization': config.token
            },
            validateStatus: (status) => status <= 202,
            time: true
        }).then(body => {

            if (!body || body.status == 404 || body.status == "404" || body.data === "Unkown Gift Code") {
                return this.logger.info(`${code}`, null, { invalid: true, ...msg });
            }

            var result = JSON.parse(body.data);
            var responseTime = new Date() - start;
            this.logger.info(`${result.message} (${responseTime / 1000}s)`, null, { invalid: false, ...message });

            notifier.notify({
                title: 'Nitrate',
                icon: 'nitro-png-2.png',
                appID: `${message.guild.name} | #${message.channel.name} | ${message.author.tag}`,
                message: result.message,
                timeout: 0.1
            });
        });
    },

    reload: function () {
        config = require("./config.json")
    },

    add: function (msg, args) {
        let id = args[1]
        let config1 = require(`./config.json`, `utf-8`)
        if (!config1.blacklisted.includes(id)) {
            config1.blacklisted.push(id)
            fs.writeFileSync('./config.json', JSON.stringify(config1), `utf-8`)
            reload()
            msg.channel.send(`Added \`${id}\` to the blacklist!`)
        }
        else {
            msg.channel.send(`That id is already in the blacklist!`)
        }
    },

    remove: function (msg, args) {
        let id = args[1]
        let config1 = require(`./config.json`, `utf-8`)
        if (config1.blacklisted.includes(id)) {
            let oof = config1.blacklisted.filter(function (item) {
                return item !== args[1]
            })
            config1.blacklisted = oof
            fs.writeFileSync('./config.json', JSON.stringify(config1), `utf-8`)
            reload()
            msg.channel.send(`Removed \`${id}\` to the blacklist!`)
        }
        else {
            msg.channel.send(`This ID is not blacklisted`)
        }
    }

}

