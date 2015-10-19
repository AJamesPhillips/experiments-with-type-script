
/**
 * @method bounded  Returns double
 * @param lowerBound inclusive
 * @param upperBound exclusive
 */
var bounded = function(lowerBound: number, upperBound: number) {
	return Math.random() * (upperBound - lowerBound) + lowerBound;
}

export {
	bounded,
}
