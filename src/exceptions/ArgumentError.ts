import { UsageError } from "./UsageError";

export class ArgumentError extends UsageError {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
