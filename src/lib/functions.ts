import {
	DMChannel,
	GroupDMChannel,
	Guild,
	GuildMember,
	Message,
	RichEmbed,
	Snowflake,
	TextChannel,
	User,
} from "discord.js";
import { client } from "../main";
import { COLORS } from "./constants";
import { db } from "./database";

type MessageChannel = TextChannel | DMChannel | GroupDMChannel;

function sendEmbed({
	author = "", avatar = "", title = "", color = "", text = "", footer = "", channel,
}) {
	const embedColor = COLORS[color];

	let avatarembed: string;
	if (avatar === "client") {
		avatarembed = client.user.avatarURL;
	} else if (avatar === "server") {
		avatarembed = channel.guild.iconURL;
	} else {
		avatarembed = avatar;
	}

	const embed = new RichEmbed()
		.setAuthor(author, avatarembed)
		.setTitle(title)
		.setColor(embedColor)
		.setDescription(text)
		.setFooter(footer);

	channel.send(embed);
}

function sendError(text = "", channel: MessageChannel) {
	const embed = new RichEmbed()
		.setAuthor("Error", client.user.avatarURL)
		.setColor(COLORS.dark_red)
		.setDescription(text);

	channel.send(embed);
}

async function getValueFromDB(table: string, column: string) {
	const result = await db.select(column).from(table);
	return result[0][column]
		? result[0][column]
		: null;
}

function fromArrayToLone(array: any | any[]) {
	return Array.isArray(array)
		? array[0]
		: array;
}

async function react(emojis: string, message: Message) {
	for (const emoji of emojis) {
		await message.react(emoji);
	}
}

async function replaceDBVars(message: string, options?: {server: Guild, member: GuildMember}): Promise<string> {
	const prefix = await getValueFromDB("server", "prefix");

	return message
		.replace("{PREFIX}", prefix)
		.replace("{SERVER}", options?.server?.name)
		.replace("{MENTION}", `<@${options?.member?.id}>`)
		.replace("{USER}", options?.member?.user.tag);
}

async function pushValueInDB(table: string, column: string, value: any) {
	await db.update({
		[column]: value,
	}).into(table);
}

async function verifUserInDB(userID: Snowflake) {
	const user = client.users.get(userID);

	const userInDB = await db
		.from("users")
		.where({ discord_id: userID });

	if (!userInDB[0]) {
		await db
			.insert({
				discord_id: userID,
				pseudo: user.tag,
			})
			.into("users");
	}
}

async function getMuteRole(server: Guild) {
	const muteRoleDB = server.roles.get(await getValueFromDB("server", "muteRoleID"));
	if (!muteRoleDB) {
		const botRole = server.member(client.user).highestRole;
		const highestRolePosition = botRole.calculatedPosition;
		const muteRole = await server.createRole({
			name: "Muted",
			color: 0x000001,
			hoist: false,
			position: highestRolePosition - 1,
			permissions: ["VIEW_CHANNEL", "CONNECT", "READ_MESSAGE_HISTORY"],
			mentionable: false,
		}, "[AUTO] Mute role not found, created");
		await pushValueInDB("server", "muteRoleID", muteRole.id);
	}

	const muteRole = server.roles.get(await getValueFromDB("server", "muteRoleID"));
	server.channels.forEach((channel) => {
		if (!channel.permissionsFor(muteRole)) {
			channel.overwritePermissions(muteRole, {
				ADD_REACTIONS: false,
				ATTACH_FILES: false,
				SEND_MESSAGES: false,
				SEND_TTS_MESSAGES: false,
				SPEAK: false,
			});
		}
	});

	return muteRole;
}

function canSanction(user: GuildMember | User | Snowflake,
					 author: GuildMember,
					 channel: MessageChannel,
					 sanction: string): boolean {
	if (!user) {
		sendError("Please mention the member. Note that they must be on the server.", channel);
		return false;
	}
	if (user === author) {
		sendError(`You can't ${sanction} yourself.`, channel);
		return false;
	}

	const member = user instanceof GuildMember
		? author.guild.member(user)
		: null;

	const clientMember = author.guild.member(client.user);

	if (member?.highestRole.comparePositionTo(clientMember.highestRole) >= 0
		|| member?.highestRole.comparePositionTo(author.highestRole) >= 0) {
		sendError(
			`You can't ${sanction} someone who is superior or equal to you or to me.`,
			channel,
		);
		return false;
	}

	return true;
}

function getDurationFromString(durationString: string): number {
	if (!durationString) return null;

	const integer = Number(durationString.match(/^[0-9]+/g)?.toString());
	const time = durationString.match(/[smhdwy]$/g)?.toString();

	if (integer <= 0) return null;

	const timeToMS = {
		s: 1000,
		m: 60 * 1000,
		h: 60 * 60 * 1000,
		d: 24 * 60 * 60 * 1000,
		w: 7 * 24 * 60 * 60 * 1000,
		y: 365 * 24 * 60 * 60 * 1000,
	};

	return integer * timeToMS[time];
}

async function unsanction(id: Snowflake, server: Guild, sanction: string, forced: boolean) {
	await verifUserInDB(id);
	const user = (await db.from("users").where({ discord_id: id, actual_sanction: sanction }))[0];

	if (!user?.expiration) return;

	const { expiration } = user;
	const now = Date.now();

	if (now < expiration && !forced) {
		return setTimeout(() => {
			unsanction(id, server, sanction, false);
		}, expiration - now);
	}

	const embed = new RichEmbed()
		.setAuthor("Moderation", server.iconURL)
		.setColor(COLORS.light_green)
		.setDescription(`You have been unmuted from ${server.name}`)
		.setTimestamp();

	if (sanction === "muted") {
		const member = server.members.get(id);
		const muteRole = await getMuteRole(server);

		if (!member
			|| !muteRole) return;

		if (member.roles.get(muteRole.id)) await member.removeRole(muteRole);
		await db.update({
			actual_sanction: null,
			created: null,
			expiration: null,
		}).into("users").where({ discord_id: id });

		await member.send(embed.setTitle("Unmute"));

		// TODO: add mod log here
		return;
	}
	// else
	const bans = await server.fetchBans(false);
	if (!bans.get(id)) return;

	await server.unban(id, "[AUTO] Sanction finished.");
	await db.update({
		actual_sanction: null,
		created: null,
		expiration: null,
	}).into("users").where({ discord_id: id });
	// TODO: add mod log here
}

function getSanctionValues(args: string[], sanction: string, member: GuildMember) {
	const isPermanent = !args[1].match(/^[0-9]+[smhdwy]$/i);

	const durationString = isPermanent
		? null
		: args.slice(1, 2).toString().toLowerCase();

	const duration = durationString
		? getDurationFromString(durationString)
		: null;

	const reason = duration
		? args.slice(2).join(" ")
		: args.slice(1).join(" ");

	const embedDescription = duration
		? `${member.user} has been ${sanction} for ${durationString} for the following reason:\n\n${reason}`
		: `${member.user} has been permanently ${sanction} for the following reason:\n\n${reason}`;

	const DMDescription = duration
		? `You have been permanently ${sanction} for the following reason:\n\n${reason}`
		: `You have been ${sanction} for ${durationString} for the following reason:\n\n${reason}`;

	return [durationString, duration, reason, embedDescription, DMDescription];
}

function stringNormalize(baseString: string): string {
	const firstLetter = baseString.charAt(0).toUpperCase();
	const rest = baseString.slice(1).replace("_", " ");

	return firstLetter + rest;
}

export {
	sendEmbed,
	sendError,
	getValueFromDB,
	fromArrayToLone,
	react,
	replaceDBVars,
	pushValueInDB,
	verifUserInDB,
	getMuteRole,
	canSanction,
	getDurationFromString,
	unsanction,
	getSanctionValues,
	stringNormalize,
};
