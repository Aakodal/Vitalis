import { UsageError } from "./UsageError";

export class ArgumentError extends UsageError {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
	}
}
