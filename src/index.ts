import { Client } from "./classes/Client";

Client.create({
	partials: ["USER", "GUILD_MEMBER", "MESSAGE", "REACTION"],
	ws: {
		intents: [
			"GUILDS",
			"GUILD_PRESENCES",
			"GUILD_MEMBERS",
			"GUILD_MESSAGES",
			"GUILD_MESSAGE_REACTIONS",
			"GUILD_EMOJIS",
			"GUILD_INVITES",
		],
	},
}).catch((error) => {
	throw error; // intended thrown error
});
