import { Command } from "../lib/Command";
import { Discord } from "../requires";
import { Client } from "../lib/Client";
import { COLORS } from "../lib/functions";

export default class EmbedBuilder extends Command {
    constructor() {
        super({
            name: "embedbuilder",
            description: "Create and send a custom embed",
            category: "Utility",
            permission: "MANAGE_MESSAGES"
        });
    }

    async run(message: Discord.Message, args: string[], client: Client) {
        const reactDefaultEmojis = async (message: Discord.Message) => {
            await message.react("👤");
            await message.react("👁");
            await message.react("📲");
            await message.react("🔵");
            await message.react("📌");
            await message.react("📝");
            await message.react("📑");
            await message.react("📷");
            await message.react("🖼");
            await message.react("📅");
            await message.react("✅");
        }

        let author: string = "Default author";
        let authorIcon: string = message.guild.iconURL;
        let authorURL: string = "";
        let color: string = COLORS["light_green"];
        let title: string = "Default title";
        let description: string = "Default description";
        let footer: string = "Default footer";
        let footerIcon: string = client.user.avatarURL;
        let thumbnail: string = "";
        let timestamp: boolean = false;

        const embedBuilder = new Discord.RichEmbed()
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

        const botMessage = await message.channel.send(embedBuilder);
        const sentMessage = Array.isArray(botMessage) ? botMessage[0] : botMessage;
        await reactDefaultEmojis(sentMessage);
        
        client.on("messageReactionAdd", (reaction, user) => {
            if(reaction.message.id !== sentMessage.id || user.bot || user.id !== message.author.id || '👤👁📲🔵📌📝📑📷🖼📅✅'.indexOf(reaction.emoji.name) < 0) return;

            const reactions: object = {
                "👤" : async () => {
                    let authorEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const authorEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current author: ${author}`)
                        .addField("✏ Edit", "Edit author's name", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(authorEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !authorEditing) return;

                        const authorReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    author = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(authorEmbed.setDescription(`Current author: ${author}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(authorEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                authorEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(authorReactions[reaction.emoji.name]) authorReactions[reaction.emoji.name]();
                    });
                },
                "👁" : async () => {
                    let authorIconEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const authorIconEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current author icon: ${authorIcon}`)
                        .addField("✏ Edit", "Edit author's icon", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(authorIconEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !authorIconEditing) return;

                        const authorIconReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    authorIcon = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(authorIconEmbed.setDescription(`Current author icon: ${authorIcon}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(authorIconEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                authorIconEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(authorIconReactions[reaction.emoji.name]) authorIconReactions[reaction.emoji.name]();
                    });
                },
                "📲" : async () => {
                    let authorURLEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const authorURLEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current author URL: ${authorURL}`)
                        .addField("✏ Edit", "Edit author's URL", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(authorURLEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !authorURLEditing) return;

                        const authorURLReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    authorURL = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(authorURLEmbed.setDescription(`Current author URL: ${authorURL}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(authorURLEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                authorURLEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(authorURLReactions[reaction.emoji.name]) authorURLReactions[reaction.emoji.name]();
                    });
                },
                "🔵": async () => {
                    let colorEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const colorEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current color: ${color}`)
                        .addField("✏ Edit", "Edit embed's color", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(colorEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !colorEditing) return;

                        const colorReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    const content: any = reply.content;
                                    if((!isNaN(+content) && (+content >= 0 && +content <= 16777215))) {
                                        color = content;
                                        embedBuilder.setColor(color);
                                    } else if(COLORS[content.toLowerCase()]) {
                                        color = content.toLowerCase();
                                        embedBuilder.setColor(COLORS[color]);
                                    } else if(content === "${clear}") {
                                        color = "";
                                        embedBuilder.setColor("");
                                    } else {
                                        const response = await botAuthorMessage.channel.send(`${reply.author} : please insert a hex literal value (\`0x000000\` to \`0xFFFFFF\`)`);
                                        const responseMessage = Array.isArray(response) ? response[0] : response;
                                        responseMessage.delete(5000);
                                    }
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(colorEmbed
                                        .setDescription(`Current color: ${color}`)
                                        .setColor(COLORS[color] || color)
                                    );
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    edited = true;
                                    botAuthorMessage.edit(colorEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                colorEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(colorReactions[reaction.emoji.name]) colorReactions[reaction.emoji.name]();
                    });
                },
                "📌": async () => {
                    let titleEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const titleEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current title: ${title}`)
                        .addField("✏ Edit", "Edit embed's title", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(titleEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !titleEditing) return;

                        const titleReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    title = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(titleEmbed.setDescription(`Current title: ${title}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(titleEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                titleEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(titleReactions[reaction.emoji.name]) titleReactions[reaction.emoji.name]();
                    });
                },
                "📝": async () => {
                    let descriptionEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const descriptionEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current description: ${description}`)
                        .addField("✏ Edit", "Edit embed's description", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(descriptionEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !descriptionEditing) return;

                        const descriptionReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    description = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(descriptionEmbed.setDescription(`Current description: ${description}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(descriptionEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                descriptionEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(descriptionReactions[reaction.emoji.name]) descriptionReactions[reaction.emoji.name]();
                    });
                },
                "📑": async () => {
                    let footerEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const footerEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current footer: ${footer}`)
                        .addField("✏ Edit", "Edit embed's footer", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(footerEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !footerEditing) return;

                        const footerReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    footer = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(footerEmbed.setDescription(`Current footer: ${footer}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(footerEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                footerEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(footerReactions[reaction.emoji.name]) footerReactions[reaction.emoji.name]();
                    });
                },
                "📷": async () => {
                    let footerIconEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const footerIconEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current footer icon: ${footerIcon}`)
                        .addField("✏ Edit", "Edit embed's footer icon", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(footerIconEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !footerIconEditing) return;

                        const footerIconReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    footerIcon = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete();
                                    edited = true;

                                    botAuthorMessage.edit(footerIconEmbed.setDescription(`Current footer icon: ${footerIcon}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(footerIconEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                footerIconEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(footerIconReactions[reaction.emoji.name]) footerIconReactions[reaction.emoji.name]();
                    });
                },
                "🖼": async () => {
                    let thumbnailEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const thumbnailEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Current thumbnail: ${thumbnail}`)
                        .addField("✏ Edit", "Edit embed's footer icon", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(thumbnailEmbed);

                    await botAuthorMessage.react("✏");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '✏🚪'.indexOf(reaction.emoji.name) < 0 || !thumbnailEditing) return;

                        const thumbnailReactions: object = {
                            "✏": async () => {
                                let edited: boolean = false;
                                botAuthorMessage.clearReactions();
                                botAuthorMessage.edit("You have 30 seconds to edit this value. If you want to clear this value, type `${clear}`.", {embed: {}});
                                client.on("message", async (reply) => {
                                    if(message.author.id !== reply.author.id || edited) return;
                                    thumbnail = reply.content === "${clear}" ? "" : reply.content;
                                    reply.delete()
                                    edited = true;

                                    botAuthorMessage.edit(thumbnailEmbed.setDescription(`Current thumbnail: ${thumbnail}`));
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                })
                                setTimeout(async () => {
                                    if(edited) return;
                                    botAuthorMessage.edit(thumbnailEmbed);
                                    await botAuthorMessage.react("✏");
                                    await botAuthorMessage.react("🚪");
                                }, 30*1000);
                            },
                            "🚪": async () => {
                                thumbnailEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(thumbnailReactions[reaction.emoji.name]) thumbnailReactions[reaction.emoji.name]();
                    });
                },
                "📅": async () => {
                    let timestampEditing: boolean = true;
                    await reaction.message.clearReactions();
                    const timestampEmbed = new Discord.RichEmbed()
                        .setAuthor("Embed builder", message.guild.iconURL)
                        .setColor(COLORS[color] || color)
                        .setDescription(`Timestamp active? ${timestamp}`)
                        .addField("🔄 Toggle", "Toggle timestamp", true)
                        .addField("🚪 Return", "Return to the main menu", true);

                    const botAuthorMessage = await sentMessage.edit(timestampEmbed);

                    await botAuthorMessage.react("🔄");
                    await botAuthorMessage.react("🚪");

                    client.on("messageReactionAdd", (reaction, user) => {
                        if(reaction.message.id !== botAuthorMessage.id || user.bot || user.id !== message.author.id || '🔄🚪'.indexOf(reaction.emoji.name) < 0 || !timestampEditing) return;

                        const timestampReactions: object = {
                            "🔄": async () => {
                                timestamp = !timestamp;
                                reaction.remove(user);
                                botAuthorMessage.edit(timestampEmbed.setDescription(`Timestamp active? ${timestamp}`));
                            },
                            "🚪": async () => {
                                timestampEditing = false;
                                await reaction.message.clearReactions();
                                botAuthorMessage.edit(embedBuilder);
                                await reactDefaultEmojis(botAuthorMessage);
                            }
                        }

                        if(timestampReactions[reaction.emoji.name]) timestampReactions[reaction.emoji.name]();
                    });
                },
                "✅": async () => {
                    const finalEmbed = new Discord.RichEmbed()
                        .setAuthor(author, authorIcon, authorURL)
                        .setColor(COLORS[color] || color)
                        .setTitle(title)
                        .setDescription(description)
                        .setFooter(footer, footerIcon)
                        .setThumbnail(thumbnail);

                    if(timestamp) finalEmbed.setTimestamp();

                    sentMessage.delete();
                    message.channel.send(finalEmbed);
                }
            }

            if(reactions[reaction.emoji.name]) reactions[reaction.emoji.name]();
        });
    }
}