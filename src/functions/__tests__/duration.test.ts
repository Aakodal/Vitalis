import { getDuration } from "..";

const DIGIT_REGEX = /^\d+$/;

const timeAliases = [
	"s",
	"second",
	"seconds",
	"m",
	"min",
	"mins",
	"minute",
	"minutes",
	"h",
	"hour",
	"hours",
	"d",
	"day",
	"days",
	"w",
	"week",
	"weeks",
	"mo",
	"month",
	"months",
	"y",
	"year",
	"years",
];

describe(getDuration, () => {
	it("should return undefined if given argument is empty", () => {
		expect(getDuration("")).toEqual(undefined);
	});

	it("should return undefined if given argument is not complete", () => {
		expect(getDuration("s")).toEqual(undefined);
		expect(getDuration("1")).toEqual(undefined);
	});

	it("should return undefined if given argument is not a supported type", () => {
		expect(getDuration("1a")).toEqual(undefined);
	});

	it("should return undefined if given integer is only made of '0'", () => {
		expect(getDuration("0s")).toEqual(undefined);
		expect(getDuration("00s")).toEqual(undefined);
		expect(getDuration("000s")).toEqual(undefined);
	});

	it("should support X0 integer", () => {
		expect(String(getDuration("10s"))).toMatch(DIGIT_REGEX);
	});

	it("should return Number.MAX_SAFE_INTEGER if final result is > than Number.MAX_SAFE_INTEGER", () => {
		expect(getDuration("99999999y")).toEqual(Number.MAX_SAFE_INTEGER);
	});

	it("should work with durations starting with '0'", () => {
		expect(getDuration("015s")).toEqual(15000);
		expect(getDuration("0015s")).toEqual(15000);
		expect(getDuration("00015s")).toEqual(15000);
		expect(getDuration("00150s")).toEqual(150000);
	});

	describe("support time aliases", () => {
		for (const time of timeAliases) {
			it(`should support ${time}`, () => {
				expect(String(getDuration(`10${time}`))).toMatch(DIGIT_REGEX);
			});
		}
	});
});
