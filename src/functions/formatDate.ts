export function formatDate(dateToFormat?: Date | number): string {
	const date = dateToFormat && new Date(dateToFormat).toString() !== "Invalid Date"
		? new Date(dateToFormat)
		: new Date();
	const dateOptions = {
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	};

	return date.toLocaleDateString(undefined, dateOptions);
}
