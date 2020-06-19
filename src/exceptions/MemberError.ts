export class MemberError extends Error {
	constructor(message = "Member not found.") {
		super(message);
		this.name = this.constructor.name;
	}
}
