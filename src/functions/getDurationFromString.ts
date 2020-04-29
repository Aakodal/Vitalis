export function getDurationFromString(durationString: string): number {
	if (!durationString) return null;

	const integer = Number(durationString.match(/^[0-9]+/g)?.toString());
	const time = durationString.match(/([smhdwy]|mo)$/g)?.toString();

	if (integer <= 0) return null;

	if (time === "mo") { // month
		const now = Date.now();
		const end = new Date(now).setMonth(new Date(now).getMonth() + integer);

		return end - now;
	}

	const timeToMS = {
		s: 1000,
		m: 60 * 1000,
		h: 60 * 60 * 1000,
		d: 24 * 60 * 60 * 1000,
		w: 7 * 24 * 60 * 60 * 1000,
		y: 365 * 24 * 60 * 60 * 1000,
	};

	const duration = integer * timeToMS[time];

	return duration > Number.MAX_SAFE_INTEGER
		? Number.MAX_SAFE_INTEGER
		: duration;
}
