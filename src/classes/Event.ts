import { ClientEvents } from "discord.js";

import { Client } from "./Client";

export abstract class Event {
	readonly event: keyof ClientEvents;

	protected readonly client: Client;

	protected constructor(discordEvent: keyof ClientEvents, client: Client) {
		this.event = discordEvent;
		this.client = client;
	}

	abstract listener(...args: unknown[]): void | Promise<void>;
}
