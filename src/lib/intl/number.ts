const long = new Intl.NumberFormat('en-US');

export const formatLong = (value: number) => {
	if (value < 1_000) {
		return '' + value;
	}

	return long.format(value);
};
