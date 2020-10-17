import { DURATION_REGEXP } from "../misc/constants";

export function getDurationFromString(durationString: string): number | null {
	if (!durationString) {
		return null;
	}

	const matches = durationString.match(DURATION_REGEXP);

	if (!matches) {
		return null;
	}

	const integer = Number(matches.groups?.integer);

	const time =
		matches.groups?.time.slice(0, 2).toLowerCase() === "mo" ? "mo" : matches.groups?.time.slice(0, 1).toLowerCase();

	if (time === "mo") {
		// month
		const now = Date.now();
		const end = new Date(now).setMonth(new Date(now).getMonth() + integer);

		return end - now;
	}

	const timeToMS: Record<string, number> = {
		s: 1000,
		m: 60 * 1000,
		h: 60 * 60 * 1000,
		d: 24 * 60 * 60 * 1000,
		w: 7 * 24 * 60 * 60 * 1000,
		y: 365 * 24 * 60 * 60 * 1000,
	};

	const duration = integer * timeToMS[time as string];

	return duration > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : duration;
}
