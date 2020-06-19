import { CommandError } from "./CommandError";

export class PermissionError extends CommandError {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
