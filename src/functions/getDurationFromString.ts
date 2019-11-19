export function getDurationFromString(durationString: string): number {
	if (!durationString) return null;

	const integer = Number(durationString.match(/^[0-9]+/g)?.toString());
	const time = durationString.match(/[smhdwy]$/g)?.toString();

	if (integer <= 0) return null;

	const timeToMS = {
		s: 1000,
		m: 60 * 1000,
		min: 60 * 1000,
		h: 60 * 60 * 1000,
		d: 24 * 60 * 60 * 1000,
		w: 7 * 24 * 60 * 60 * 1000,
		y: 365 * 24 * 60 * 60 * 1000,
	};

	return integer * timeToMS[time];
}
