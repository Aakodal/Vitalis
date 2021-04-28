export type FormattedString = string | ((...values: (string | Record<string, unknown>)[]) => string);

export function format(text: TemplateStringsArray, ...keys: (string | number)[]): FormattedString {
	return function cur(...values: (string | Record<string, unknown>)[]): string {
		const dict = (values[values.length - 1] as Record<string, unknown>) || {};
		const result = [text[0]];

		keys.forEach((key, index) => {
			const value = (Number.isInteger(key) ? values[key as number] : dict[key as string]) as string;
			result.push(value, text[index + 1]);
		});

		return result.join("");
	};
}
