export function formatDate(dateToFormat?: Date | number) {
	const date = dateToFormat && new Date(dateToFormat).toString() !== "Invalid Date"
		? new Date(dateToFormat)
		: new Date();
	const dateOptions = Object.freeze({ hour: "numeric", minute: "numeric", second: "numeric" });

	return date.toLocaleDateString(undefined, dateOptions);
}
