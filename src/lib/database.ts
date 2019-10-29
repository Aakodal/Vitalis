import { client, db } from "../requires";

client.on("databaseCheck", async () => {
    await db.schema.hasTable("infractions").then(exists => {
        if(!exists) {
            db.schema.createTable("infractions", table => {
                table.increments('id').primary();
                table.string('discord_id');
                table.string("pseudo")
                table.text("infraction");
                table.enum("type", ["warn", "mute", "kick", "ban"]);
                table.timestamp("created");
                table.timestamp("expiration");
                table.string("duration");
                table.string("moderator");
            }).then(() => {
                console.log("Infractions table created successfully.");
            }).catch((error) => {
                console.error(error);
            });
        }
    });

    await db.schema.hasTable("users").then(exists => {
        if(!exists) {
            db.schema.createTable("users", table => {
                table.increments('id').primary();
                table.string('discord_id');
                table.string("pseudo")
                table.timestamp("last_warn");
                table.enum("actual_sanction", ["muted", "banned" ]);
                table.timestamp("created");
                table.timestamp("expiration");
                table.text("reason");
            }).then(() => {
                console.log("Users table created successfully.");
            }).catch((error) => {
                console.error(error);
            });
        }
    });

    await db.schema.hasTable("server").then(async (exists) => {
        if(!exists) {
            try {
                await db.schema.createTable("server", (table) => {
                    table.increments('id').primary();
                    table.string("prefix");
                    //activity
                    table.enum("status", ["online", "idle", "offline", "dnd"]);
                    table.boolean("gameActive");
                    table.enum("gameType", [ "PLAYING", "LISTENING", "WATCHING", "STREAMING" ]);
                    table.string("gameName");
                    //votes
                    table.string("votesChannel");
                    //logs
                    table.boolean("logsActive");
                    table.string("logsChannel");
                    //modLogs
                    table.boolean("modlogsActive");
                    table.string("modlogsChannel");
                    //muterole
                    table.string("muteRoleID");
                    table.string("muteRoleName");
                    table.boolean("ADD_REACTIONS");
                    table.boolean("ATTACH_FILES");
                    table.boolean("CHANGE_NICKNAME");
                    table.boolean("SEND_MESSAGES");
                    table.boolean("SEND_TTS_MESSAGES");
                    table.boolean("SPEAK");
                });
                await db.insert({
                    prefix: "!",
                    status: "online",
                    gameActive: true,
                    gameType: "LISTENING",
                    gameName: "{PREFIX}help",
                    logsActive: true,
                    modlogsActive: true,
                    muteRoleName: "Muted",
                    ADD_REACTIONS: false,
                    ATTACH_FILES: false,
                    CHANGE_NICKNAME: false,
                    SEND_MESSAGES: false,
                    SEND_TTS_MESSAGES: false,
                    SPEAK: false
                }).into("server");
                console.log("Server table created successfully.");
            } catch(error) {
                console.error(error);
            }
        }
    });

    /*await db.from("users").where({actual_sanction: "muted"}).then(data => {
        if(!data[0]) return;
        const guild = client.guilds.get(config.server);
        data.forEach(async user => {
            if(user.expiration) {
                await client.emit("mute", user.discord_id, guild);
            }
        });
    });

    await db.from("users").where({actual_sanction: "banned"}).then(data => {
        if(!data[0]) return;
        const guild = client.guilds.get(config.server);
        data.forEach(async user => {
            if(user.expiration) {
                await client.emit("ban", user.discord_id, guild);
            }
        });
    });*/
});