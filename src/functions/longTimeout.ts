export function longTimeout(handler: TimerHandler, timeout: number) {
	const MAX_TIMEOUT_TIME = 2147483647;

	if (timeout > MAX_TIMEOUT_TIME) {
		const newTimeout = timeout - MAX_TIMEOUT_TIME;
		return setTimeout(() => {
			longTimeout(handler, newTimeout);
		}, MAX_TIMEOUT_TIME);
	}

	return setTimeout(handler, timeout);
}
