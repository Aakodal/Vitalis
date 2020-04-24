import { CommandError } from "./CommandError";

export class UsageError extends CommandError {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
	}
}
