import { Message, RichEmbed } from "discord.js";
import { Command } from "../../lib/Command";
import { Client } from "../../lib/Client";
import { COLORS } from "../../lib/constants";
import { fromArrayToLone } from "../../functions/fromArrayToLone";
import { react } from "../../functions/react";

export default class EmbedBuilder extends Command {
	constructor() {
		super({
			name: "embedbuilder",
			description: "Create and send a custom embed",
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		const MAX_HEXADECIMAL_INTEGER = 16777215;

		let author = "Default author";
		let authorIcon = message.guild.iconURL;
		let authorURL = "";
		let color: string | number = COLORS.light_green;
		let title = "Default title";
		let description = "Default description";
		let footer = "Default footer";
		let footerIcon = client.user.avatarURL;
		let thumbnail = "";
		let timestamp = false;

		const embedBuilder = new RichEmbed()
			.setAuthor("Embed builder", message.guild.iconURL)
			.setColor(COLORS[color] || color)
			.setTitle("React with any of the below emojis to edit your embed.")
			.addField("👤 Author", "Change author's name", true)
			.addField("👁 Author icon", "Change author's icon", true)
			.addField("📲 Author URL", "Change author's URL", true)
			.addField("🔵 Color", "Change embed's color", true)
			.addField("📌 Title", "Change embed's title", true)
			.addField("📝 Description", "Change embed's description", true)
			.addField("📑 Footer", "Change footer's text", true)
			.addField("📷 Footer icon", "Change footer's icon", true)
			.addField("🖼 Thumbnail", "Change embed's thumbnail", true)
			.addField("📅 Timestamp", "Toggle embed's timestamp", true)
			.addBlankField()
			.addField("✅ Send", "Send your embed");

		async function editValue(valueType: string, botMessage: Message, currentEmbed: RichEmbed) {
			let edited = false;
			await botMessage.clearReactions();
			await botMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.",
				{ embed: {} });

			client.on("message", async (reply) => {
				if (message.author.id !== reply.author.id
					|| message.channel !== reply.channel
                    || edited) return;

				const newValue = reply.content === "${clear}"
					? ""
					: reply.content;

				const { content } = reply;
				const colorNumber = Number(content);

				switch (valueType) {
					case "author":
						author = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current author: ${author}`));
						break;
					case "authorIcon":
						authorIcon = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current author icon: ${authorIcon}`));
						break;
					case "authorURL":
						authorURL = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current author URL: ${authorURL}`));
						break;
					case "color":
						if ((!Number.isNaN(colorNumber) && colorNumber >= 0 && colorNumber <= MAX_HEXADECIMAL_INTEGER)) {
							color = content;
							embedBuilder.setColor(color);
						} else if (Object.keys(COLORS).includes(content.toLowerCase())) {
							color = content.toLowerCase();
							embedBuilder.setColor(COLORS[color]);
						} else if (content === "${clear}") {
							color = "";
							embedBuilder.setColor("");
						} else {
							const response = fromArrayToLone(await botMessage.channel.send(
								`${reply.author} : please insert a hex literal value (\`0x000000\` to \`0xFFFFFF\`)`,
							));
							await response.delete(5 * 1000);
						}
						await botMessage.edit(currentEmbed
							.setDescription(`Current color: ${color}`)
							.setColor(COLORS[color] || color));
						break;
					case "title":
						title = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current title: ${title}`));
						break;
					case "description":
						description = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current description: ${description}`));
						break;
					case "footer":
						footer = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current footer: ${footer}`));
						break;
					case "footerIcon":
						footerIcon = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current footer icon: ${footerIcon}`));
						break;
					case "thumbnail":
						thumbnail = newValue;
						await botMessage.edit(currentEmbed.setDescription(`Current thumbnail: ${thumbnail}`));
						break;
				}

				await reply.delete();
				edited = true;

				await react("✏🚪", botMessage);
			});

			setTimeout(async () => {
				if (edited) return;
				await botMessage.edit(currentEmbed);
				await react("✏🚪", botMessage);
			}, 30 * 1000);
		}

		const botMessage = fromArrayToLone(await message.channel.send(embedBuilder));
		await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);

		client.on("messageReactionAdd", (reaction, user) => {
			if (reaction.message.id !== botMessage.id
                || user.bot
                || user.id !== message.author.id
                || "👤👁📲🔵📌📝📑📷🖼📅✅".indexOf(reaction.emoji.name) < 0) return;

			const reactions: object = {
				"👤": async () => {
					let authorEditing = true;
					await reaction.message.clearReactions();

					const authorEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current author: ${author}`)
						.addField("✏ Edit", "Edit author's name", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(authorEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !authorEditing) return;

						const authorReactions: object = {
							"✏": async () => {
								await editValue("author", botAuthorMessage, authorEmbed);
							},
							"🚪": async () => {
								authorEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (authorReactions[reaction.emoji.name]) authorReactions[reaction.emoji.name]();
					});
				},
				"👁": async () => {
					let authorIconEditing = true;
					await reaction.message.clearReactions();

					const authorIconEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current author icon: ${authorIcon}`)
						.addField("✏ Edit", "Edit author's icon", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(authorIconEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !authorIconEditing) return;

						const authorIconReactions: object = {
							"✏": async () => {
								await editValue("authorIcon", botAuthorMessage, authorIconEmbed);
							},
							"🚪": async () => {
								authorIconEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (authorIconReactions[reaction.emoji.name]) authorIconReactions[reaction.emoji.name]();
					});
				},
				"📲": async () => {
					let authorURLEditing = true;
					await reaction.message.clearReactions();

					const authorURLEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current author URL: ${authorURL}`)
						.addField("✏ Edit", "Edit author's URL", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(authorURLEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !authorURLEditing) return;

						const authorURLReactions: object = {
							"✏": async () => {
								await editValue("authorURL", botAuthorMessage, authorURLEmbed);
							},
							"🚪": async () => {
								authorURLEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (authorURLReactions[reaction.emoji.name]) authorURLReactions[reaction.emoji.name]();
					});
				},
				"🔵": async () => {
					let colorEditing = true;
					await reaction.message.clearReactions();

					const colorEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current color: ${color}`)
						.addField("✏ Edit", "Edit embed's color", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(colorEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !colorEditing) return;

						const colorReactions: object = {
							"✏": async () => {
								await editValue("color", botAuthorMessage, colorEmbed);
							},
							"🚪": async () => {
								colorEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (colorReactions[reaction.emoji.name]) colorReactions[reaction.emoji.name]();
					});
				},
				"📌": async () => {
					let titleEditing = true;
					await reaction.message.clearReactions();

					const titleEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current title: ${title}`)
						.addField("✏ Edit", "Edit embed's title", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(titleEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !titleEditing) return;

						const titleReactions: object = {
							"✏": async () => {
								await editValue("title", botAuthorMessage, titleEmbed);
							},
							"🚪": async () => {
								titleEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (titleReactions[reaction.emoji.name]) titleReactions[reaction.emoji.name]();
					});
				},
				"📝": async () => {
					let descriptionEditing = true;
					await reaction.message.clearReactions();

					const descriptionEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current description: ${description}`)
						.addField("✏ Edit", "Edit embed's description", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(descriptionEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !descriptionEditing) return;

						const descriptionReactions: object = {
							"✏": async () => {
								await editValue("description", botAuthorMessage, descriptionEmbed);
							},
							"🚪": async () => {
								descriptionEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (descriptionReactions[reaction.emoji.name]) descriptionReactions[reaction.emoji.name]();
					});
				},
				"📑": async () => {
					let footerEditing = true;
					await reaction.message.clearReactions();

					const footerEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current footer: ${footer}`)
						.addField("✏ Edit", "Edit embed's footer", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(footerEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !footerEditing) return;

						const footerReactions: object = {
							"✏": async () => {
								await editValue("footer", botAuthorMessage, footerEmbed);
							},
							"🚪": async () => {
								footerEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (footerReactions[reaction.emoji.name]) footerReactions[reaction.emoji.name]();
					});
				},
				"📷": async () => {
					let footerIconEditing = true;
					await reaction.message.clearReactions();

					const footerIconEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current footer icon: ${footerIcon}`)
						.addField("✏ Edit", "Edit embed's footer icon", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(footerIconEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !footerIconEditing) return;

						const footerIconReactions: object = {
							"✏": async () => {
								await editValue("footerIcon", botAuthorMessage, footerIconEmbed);
							},
							"🚪": async () => {
								footerIconEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (footerIconReactions[reaction.emoji.name]) footerIconReactions[reaction.emoji.name]();
					});
				},
				"🖼": async () => {
					let thumbnailEditing = true;
					await reaction.message.clearReactions();

					const thumbnailEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Current thumbnail: ${thumbnail}`)
						.addField("✏ Edit", "Edit embed's footer icon", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(thumbnailEmbed);

					await react("✏🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "✏🚪".indexOf(reaction.emoji.name) < 0
                            || !thumbnailEditing) return;

						const thumbnailReactions: object = {
							"✏": async () => {
								await editValue("thumbnail", botAuthorMessage, thumbnailEmbed);
							},
							"🚪": async () => {
								thumbnailEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (thumbnailReactions[reaction.emoji.name]) thumbnailReactions[reaction.emoji.name]();
					});
				},
				"📅": async () => {
					let timestampEditing = true;
					await reaction.message.clearReactions();

					const timestampEmbed = new RichEmbed()
						.setAuthor("Embed builder", message.guild.iconURL)
						.setColor(COLORS[color] || color)
						.setDescription(`Timestamp active? ${timestamp}`)
						.addField("🔄 Toggle", "Toggle timestamp", true)
						.addField("🚪 Return", "Return to the main menu", true);

					const botAuthorMessage = await botMessage.edit(timestampEmbed);

					await react("🔄🚪", botAuthorMessage);

					client.on("messageReactionAdd", (reaction, user) => {
						if (reaction.message.id !== botAuthorMessage.id
                            || user.bot
                            || user.id !== message.author.id
                            || "🔄🚪".indexOf(reaction.emoji.name) < 0
                            || !timestampEditing) return;

						const timestampReactions: object = {
							"🔄": async () => {
								timestamp = !timestamp;
								await reaction.remove(user);
								await botAuthorMessage.edit(timestampEmbed.setDescription(`Timestamp active? ${timestamp}`));
							},
							"🚪": async () => {
								timestampEditing = false;
								await reaction.message.clearReactions();
								await botAuthorMessage.edit(embedBuilder);
								await react("👤👁📲🔵📌📝📑📷🖼📅✅", botMessage);
							},
						};

						if (timestampReactions[reaction.emoji.name]) timestampReactions[reaction.emoji.name]();
					});
				},
				"✅": async () => {
					const finalEmbed = new RichEmbed()
						.setAuthor(author, authorIcon, authorURL)
						.setColor(COLORS[color] || color)
						.setTitle(title)
						.setDescription(description)
						.setFooter(footer, footerIcon)
						.setThumbnail(thumbnail);

					if (timestamp) finalEmbed.setTimestamp();

					await botMessage.delete();
					await message.channel.send(finalEmbed);
				},
			};

			if (reactions[reaction.emoji.name]) reactions[reaction.emoji.name]();
		});
	}
}
