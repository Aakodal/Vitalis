export function longTimeout(handler: TimerHandler, timeout: number): number | NodeJS.Timeout { // one comes from @types/node, another from typescript; strange behavior
	const MAX_TIMEOUT_TIME = 2147483647;

	if (timeout > MAX_TIMEOUT_TIME) {
		const newTimeout = timeout - MAX_TIMEOUT_TIME;
		return setTimeout(() => {
			longTimeout(handler, newTimeout);
		}, MAX_TIMEOUT_TIME);
	}

	// eslint-disable-next-line @typescript-eslint/no-implied-eval
	return setTimeout(handler, timeout);
}
