import { getUserIdFromString } from "../src/functions/getUserIdFromString";
import * as assert from "assert";

describe(getUserIdFromString, () => {
	it("should return undefined if given string does not match the regexp", () => {
		assert.deepStrictEqual(getUserIdFromString("<@1"), undefined);
		assert.deepStrictEqual(getUserIdFromString("1>"), undefined);
		assert.deepStrictEqual(getUserIdFromString("<1>"), undefined);
		assert.deepStrictEqual(getUserIdFromString("<!1>"), undefined);
	});

	it("should return '123456789' using mention", () => {
		assert.deepStrictEqual(getUserIdFromString("<@123456789>"), "123456789");
		assert.deepStrictEqual(getUserIdFromString("<@!123456789>"), "123456789");
	});

	it("should return '123456789' using id", () => {
		assert.deepStrictEqual(getUserIdFromString("123456789"), "123456789");
	});
});
