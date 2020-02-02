const {
    Logger,
    DefaultFormatter,
    LogLevelColor,
    LogLevel
} = require("@ayana/logger");
const { Color } = require("@ayana/logger/build/util");
const fecha = require("fecha");

class CustomFormatter extends DefaultFormatter {
    constructor(...args) {
        super(...args);
        this.colored = new Color();
    }
    get timestamp() {
        return this.colored.dim(
            this.colored.gray(fecha.format(Date.now(), "hh:mm MM/DD/YYYY"))
        );
    }

    formatDefault(meta, message) {
        const timestamp = this.timestamp;
        const topic = this.colored.yellow(`(Gift Snatcher)`);
        const level = this.colored.get(
            (LogLevelColor)[meta.level],
            meta.level.padEnd(6)
        );
        const name = `[${this.colored.magenta(
            `\u001b[1m${meta.origin.packageName}:`
        )}${this.colored.blue(`${meta.origin.packagePath}${meta.origin.name}`)}${
            meta.uniqueMarker ? `/${this.colored.gray(`${meta.uniqueMarker}`)}` : ""
            }\u001b[22m]`;
        return `${timestamp} ${topic} ${level}${name}: ${message}`;
    }

    formatMessage(meta, message) {
        if (meta.extra.invalid === undefined || !meta.extra.author)
            return this.formatDefault(meta, message);
        const invalid = this.colored.get(
            meta.extra.invalid ? "red" : "green",
            meta.extra.invalid ? "INVALID CODE".padEnd(12) : "VALID CODE".padEnd(12)
        );
        const location = meta.extra.channel.guild
            ? `${this.colored.get(
                "cyan",
                `${meta.extra.channel.guild.name}`
            )}${this.colored.get("white", "#")}${this.colored.yellow(
                meta.extra.channel.name
            )}`
            : `${this.colored.get("cyan", "DM")}`;
        const provider = this.colored.cyan(meta.extra.author.tag);
        return `${invalid}${this.colored.get("white", ` - [`)}${location}${this.colored.get("white",
            `] - `
        )}${provider}: ${message}`;
    }
};

Logger.getDefaultTransport().setLevel(LogLevel.TRACE);
Logger.setFormatter(new CustomFormatter());

module.exports = CustomFormatter;