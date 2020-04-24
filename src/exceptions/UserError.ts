export class UserError extends Error {
	constructor(message = "User not found.") {
		super(message);
		this.name = this.constructor.name;
	}
}
