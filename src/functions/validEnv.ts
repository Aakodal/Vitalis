export function validEnv(): boolean {
	return Boolean(process.env.TOKEN && process.env.BOT_OWNER);
}
