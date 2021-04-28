import { getUserIdFromString } from "..";

describe(getUserIdFromString, () => {
	it("should return undefined if given string does not match the regexp", () => {
		expect(getUserIdFromString("<@1")).toEqual(undefined);
		expect(getUserIdFromString("1>")).toEqual(undefined);
		expect(getUserIdFromString("<1>")).toEqual(undefined);
		expect(getUserIdFromString("<!1>")).toEqual(undefined);
	});

	it("should return '123456789' using mention", () => {
		expect(getUserIdFromString("<@123456789>")).toEqual("123456789");
		expect(getUserIdFromString("<@!123456789>")).toEqual("123456789");
	});

	it("should return '123456789' using id", () => {
		expect(getUserIdFromString("123456789")).toEqual("123456789");
	});
});
