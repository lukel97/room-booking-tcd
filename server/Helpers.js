const https = require("https");
const http = require("http");
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

exports.getPage = function(options) {
	return new Promise((resolve, reject) => {
		try {
			https.get(options, (res) => {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
						resolve(rawData);
				});
			});
		} catch(e) {
			reject(e);
		}
	})
}

exports.getPageHttp = function(options) {
	return new Promise((resolve, reject) => {
		try {
			http.get(options, (res) => {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
						resolve(rawData);
				});
			});
		} catch(e) {
			reject(e);
		}
	})
}

Number.prototype.pad = function(size) {
	var s = String(this);
	while(s.length < size)	s = "0" + s;
	return s;
}