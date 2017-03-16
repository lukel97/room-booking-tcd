/**
 * Returns an array of integers within the specified range
 */
exports.range = function(begin, end, interval = 1) {
	var array = [];
	for(let i = begin; i <= end; i += interval) {
		array.push(i);
	}
	return array;
}