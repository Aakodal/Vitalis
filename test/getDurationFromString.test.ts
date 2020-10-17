import { getDurationFromString } from "../src/functions/getDurationFromString";
import * as assert from "assert";

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

describe(getDurationFromString, () => {
	it("should return null if given argument is empty", () => {
		assert.deepStrictEqual(getDurationFromString(""), null);
	});

	it("should return null if given argument is not complete", () => {
		assert.deepStrictEqual(getDurationFromString("s"), null);
		assert.deepStrictEqual(getDurationFromString("1"), null);
	});

	it("should return null if given argument starts with a 0", () => {
		assert.deepStrictEqual(getDurationFromString("0s"), null);
		assert.deepStrictEqual(getDurationFromString("01s"), null);
	});

	it("should return null if given argument is not a supported type", () => {
		assert.deepStrictEqual(getDurationFromString("1a"), null);
	});

	it("should support X0 integer", () => {
		assert.match(String(getDurationFromString("10s")), DIGIT_REGEX);
	});

	it("should return Number.MAX_SAFE_INTEGER if final result is > than Number.MAX_SAFE_INTEGER", () => {
		assert.deepStrictEqual(getDurationFromString("99999999y"), Number.MAX_SAFE_INTEGER);
	});

	describe("support time aliases", () => {
		for (const time of timeAliases) {
			it(`should support ${time}`, () => {
				assert.match(String(getDurationFromString(`10${time}`)), DIGIT_REGEX);
			});
		}
	});
});
