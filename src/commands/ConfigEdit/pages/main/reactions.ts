import { Message, User } from "discord.js";

import { changePage } from "../../functions/changePage";
import { ReactionsEffects } from "../../index";
import { getJoiningMessageEmbed } from "../joiningMessage/embed";
import { getJoiningMessageReactionsEffects } from "../joiningMessage/reactions";
import { getJoiningMessageActiveEmbed } from "../joiningMessageActive/embed";
import { getJoiningMessageActiveReactionsEffects } from "../joiningMessageActive/reactions";
import { getJoiningMessageChannelEmbed } from "../joiningMessageChannel/embed";
import { getJoiningMessageChannelReactionsEffects } from "../joiningMessageChannel/reactions";
import { getJoiningRoleEmbed } from "../joiningRole/embed";
import { getJoiningRoleReactionsEffects } from "../joiningRole/reactions";
import { getJoiningRoleActiveEmbed } from "../joiningRoleActive/embed";
import { getJoiningRoleActiveReactionsEffects } from "../joiningRoleActive/reactions";
import { getLeavingMessageEmbed } from "../leavingMessage/embed";
import { getLeavingMessageReactionsEffects } from "../leavingMessage/reactions";
import { getLeavingMessageActiveEmbed } from "../leavingMessageActive/embed";
import { getLeavingMessageActiveReactionsEffects } from "../leavingMessageActive/reactions";
import { getLeavingMessageChannelEmbed } from "../leavingMessageChannel/embed";
import { getLeavingMessageChannelReactionsEffects } from "../leavingMessageChannel/reactions";
import { getLogsActiveEmbed } from "../logsActive/embed";
import { getLogsActiveReactionsEffects } from "../logsActive/reactions";
import { getLogsChannelEmbed } from "../logsChannel/embed";
import { getLogsChannelReactionsEffects } from "../logsChannel/reactions";
import { getModLogsActiveEmbed } from "../modLogsActive/embed";
import { getModLogsActiveReactionsEffects } from "../modLogsActive/reactions";
import { getModLogsChannelEmbed } from "../modLogsChannel/embed";
import { getModLogsChannelReactionsEffects } from "../modLogsChannel/reactions";
import { getMuteRoleEmbed } from "../muteRole/embed";
import { getMuteRoleReactionsEffects } from "../muteRole/reactions";
import { getPrefixEmbed } from "../prefix/embed";
import { getPrefixReactionsEffects } from "../prefix/reactions";
import { getVotesChannelEmbed } from "../votesChannel/embed";
import { getVotesChannelReactionsEffects } from "../votesChannel/reactions";

export function getMainReactionsEffects(message: Message, author: User): ReactionsEffects {
	return {
		"❗": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getPrefixEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getPrefixReactionsEffects(this);
				},
			}),
		"📝": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getVotesChannelEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getVotesChannelReactionsEffects(this);
				},
			}),
		"📑": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getLogsActiveEmbed,
				reactions: "🔄🚪",
				reactionsEffects(): ReactionsEffects {
					return getLogsActiveReactionsEffects(this);
				},
			}),
		"📃": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getLogsChannelEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getLogsChannelReactionsEffects(this);
				},
			}),
		"🔨": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getModLogsActiveEmbed,
				reactions: "🔄🚪",
				reactionsEffects(): ReactionsEffects {
					return getModLogsActiveReactionsEffects(this);
				},
			}),
		"⚒": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getModLogsChannelEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getModLogsChannelReactionsEffects(this);
				},
			}),
		"📥": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getJoiningMessageActiveEmbed,
				reactions: "🔄🚪",
				reactionsEffects(): ReactionsEffects {
					return getJoiningMessageActiveReactionsEffects(this);
				},
			}),
		"📜": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getJoiningMessageChannelEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getJoiningMessageChannelReactionsEffects(this);
				},
			}),
		"🖊️": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getJoiningMessageEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getJoiningMessageReactionsEffects(this);
				},
			}),
		"⚜️": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getJoiningRoleActiveEmbed,
				reactions: "🔄🚪",
				reactionsEffects(): ReactionsEffects {
					return getJoiningRoleActiveReactionsEffects(this);
				},
			}),
		"💠": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getJoiningRoleEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getJoiningRoleReactionsEffects(this);
				},
			}),
		"📤": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getLeavingMessageActiveEmbed,
				reactions: "🔄🚪",
				reactionsEffects(): ReactionsEffects {
					return getLeavingMessageActiveReactionsEffects(this);
				},
			}),
		"📄": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getLeavingMessageChannelEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getLeavingMessageChannelReactionsEffects(this);
				},
			}),
		"🖋️": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getLeavingMessageEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getLeavingMessageReactionsEffects(this);
				},
			}),
		"🤐": async (): Promise<void> =>
			changePage({
				message,
				author,
				embed: getMuteRoleEmbed,
				reactions: "✏🚪",
				reactionsEffects(): ReactionsEffects {
					return getMuteRoleReactionsEffects(this);
				},
			}),
		"✅": async (): Promise<void> => {
			try {
				await message.delete();
			} catch {}
		},
	};
}
