import { client, fs, token, dateFns, config } from "./requires";
import { sendError, getValueFromDB } from "./lib/functions";
import "./lib/database";
import "./lib/presence"

client.login(token);

client.emit("databaseCheck");

fs.readdir("./commands/").then((files) => {
    files.filter((file) => file.endsWith(".ts") || file.endsWith(".js")).forEach((file) => {
        client.loadCommand(file);
    });
});

client.on("ready", () => {
    client.emit("botPresenceUpdate");

    const currentTime = dateFns.format(Date.now(), "H:mm:ss");
    console.log(`Vitalis started at ${currentTime}`);
});

client.on("message", async (message) => {
    const prefix = await getValueFromDB("server", "prefix");

    if(!message.content.startsWith(prefix)
        || message.author.bot
        || !message.guild) return;

    const [commandName, ...args] = message.content.slice(prefix.length).split(/\s+/);
    const commandNameLower = commandName.toLowerCase();
    if(!client.commands.has(commandNameLower) && !client.aliases.has(commandNameLower)) return;

    const command: any = client.commands.get(commandNameLower) || client.aliases.get(commandNameLower);

    try {
        if(!command.permission) {
            return command.run(message, args, client);
        }
        if(command.permission.toUpperCase() === "BOT_OWNER") {
            if(message.author.id !== config.botOwner) return;
            return command.run(message, args, client);
        }
        if(message.member.hasPermission(command.permission)) {
            return command.run(message, args, client);
        }
    } catch(error) {
        return sendError(error, message.channel);
    }
});