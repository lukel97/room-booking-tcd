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
			console.log(e);
			reject("Internal server error");
		}
	})
}

exports.getPageHttp = function(options, returnHeaders = false) {
	return new Promise((resolve, reject) => {
		try {
			http.get(options, (res) => {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
					if(returnHeaders)
						resolve({data: rawData, headers: res.headers});
					else
						resolve(rawData);
				});
			});
		} catch(e) {
			console.log(e);
			reject("Internal server error");
		}
	})
}

exports.postHttp = function(data, options) {
	options.protocol = "http:"
	options.method = "POST";
	return new Promise((resolve, reject) => {
		try {
			let request = http.request(options, function(res) {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
					resolve(rawData);
				});
			});
			request.write(data);
			request.end();
		} catch(error) {
			console.log(e);
			reject("Internal server error");
		}
	});
}

Number.prototype.pad = function(size) {
	var s = String(this);
	while(s.length < size)	s = "0" + s;
	return s;
}