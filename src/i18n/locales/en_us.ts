import { format as f } from "../index";

export const locale = {
	moderation: {
		name: "Moderation",
	},
	misc: {
		noPermissions: f`[${"server"}] Vitalis does not have sufficent permissions to work.`,
	},
	sanction: {
		unsanction: {
			unmute: "Unmute",
			auto: {
				muted: f`[AUTO] ${0} has been unmuted (sanction timeout).`,
				banned: f`[AUTO] ${0} has been unbanned (sanction timeout).`,
				unbanReason: "[AUTO] Sanction finished.",
			},
			mp: {
				muted: f`You have been unmuted from ${0}.`,
			},
		},
	},
};
