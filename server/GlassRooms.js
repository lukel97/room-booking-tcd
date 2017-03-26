const Amenities = require('./Amenities');
const helpers = require('./Helpers');
const https = require('https');
const cheerio = require('cheerio');

const glassRoomAmenities = {	1: [Amenities.TV],
								2: [Amenities.TV],
								3: [Amenities.TV],
								4: [],
								5: [Amenities.TV],
								6: [Amenities.TV],
								7: [Amenities.TV],
								8: [Amenities.TV],
								9: [Amenities.TV] };

Array.prototype.flatten = function() {
	return this.reduce((array, x) => array.concat(x), []);
}
								
exports.getMyGlassRoomBookings = function(username, password, cancelValues = false, room) {
	const options = {
	  protocol: 'https:',
	  host: 'www.scss.tcd.ie',
	  path: `/cgi-bin/webcal/sgmr/sgmr${room}.cancel.pl`,
	  //args 2 and 3 are the username and password
	  auth: `${username}:${password}`
	};

	return new Promise((resolve, reject) => {
		try {
			https.get(options, function(res) {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
						resolve({
							roomNumber: room,
							bookings: cancelValues ? getCancelValues(rawData) : parseMyGlassRoomBookings(rawData)
						});
				});
			});
		} catch(e) {
			reject(e)
		}
	})

}

function getCancelValues(data) {
	let $ = cheerio.load(data);

	let form = $("form[action$='.cancel.pl']");
	return values = form.find("input[type='CHECKBOX']").map((i, e) => $(e).val()).get();
}

function parseMyGlassRoomBookings(data) {
	let bookings = getCancelValues(data).map(s => {
		let parts = s.split("|");
		let year = parseInt(parts[0].slice(0, 4));
		let month = parseInt(parts[0].slice(4, 6)) - 1;	//Months are zero indexed
		let day = parseInt(parts[0].slice(6, 8));

		let [from, to] = parts[1].split("-");

		let hours = parseInt(from.slice(0, 2));

		let date = new Date();
		date.setFullYear(year);
		date.setMonth(month);
		date.setDate(day);
		date.setHours(hours);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

		return date;
	});

	return bookings;
}

exports.getAvailableTimes = function(date, room) {
	let requestData = `Month=${(date.getMonth() + 1)}&Year=${date.getFullYear()}`;
	const options = {
	  protocol: 'https:',
	  host: 'www.scss.tcd.ie',
	  path: `/cgi-bin/webcal/sgmr/sgmr${room}.pl`,
	  //args 2 and 3 are the username and password
	  auth: process.argv.slice(2, 4).join(":"),
	  method: "SUBMIT",
	  headers: {
		  "Content-Length": requestData.length,
		  "Content-Type": "application/x-www-form-urlencoded"
	  }
	};

	return new Promise((resolve, reject) => {
		try {
			let request = https.request(options, function(res) {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
					
					let bookings = scrapeBookedTimesGlassrooms(rawData).filter(isToday.bind(null, date));
					let availableTimes = helpers.range(0, 23)
						.map(hour => {
							let time = new Date(date.getTime());
							time.setHours(hour);
							return time;
						})
						.filter(x => !bookings.map(y => y.getTime()).includes(x.getTime()))
						.filter(isToday.bind(null, date));
					
					resolve({
						roomNumber: room,
						capacity: getRoomCapacity(rawData),
						amenities: glassRoomAmenities[parseInt(room)],
						availableTimes: availableTimes
					});
				});
			});

			request.write(requestData);
			request.end();
		} catch(e) {
			reject(e);
		}
	});
}

function isToday(now, date) {
	return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getYear() === now.getYear();
}

function getRoomCapacity(data) {
	let header = cheerio.load(data)("h1:contains(Capacity)").text();
	let capacity = header.match(".*Capacity ([0-9]+)")[1];
	return parseInt(capacity);
}

function scrapeBookedTimesGlassrooms(data) {

	let $ = cheerio.load(data);

	// ***** START SCRAPING THE HTML ******

	var tableObj = $("table[border!='3']").filter("table[cellpadding='3']");

	var textObj = tableObj.find("font");

	var arr = new Array();
	var tempArr = new Array();
	var tempStr;
	$( textObj ).each(function( index ) {
		tempStr = $( this ).html();
		tempArr = tempStr.split("<br>");
		for (var i = 0; i < tempArr.length; i++) {
			arr.push(tempArr[i]);
		}
	});

	// ***** FINISHED SCRAPING *****

	// Arr hopefully has all the necessary data to be parsed
	// *** This may have extra stuff we may have to filter out ***

	//console.log(arr);
	//Array of final objects
	var monthBookings = [];

	//Get current year to determine if array entry is a date
	var currentYear = new Date().getFullYear();

	var currentDate;

	//Loop through entire array, checking for dates and booking times
	for (var i = 0; i < arr.length; i++) {
		if(arr[i].indexOf(currentYear) != -1) {
			//This index is potentially a date
			var endOfDate = arr[i].indexOf("(");
			if(endOfDate != -1) {
				//Check if it's the first iteration
				var date = arr[i].substring(0, endOfDate);
				currentDate = date;
			}
		}
		else {
			//It's a booking 🎉
			//Just presuming 11 is the right length (THIS SHOULD BE CHECKED)
			//Get the start and end dates
			var [start, end] = arr[i].split(" ")[0].split("-").map(time => new Date(currentDate + time));

			//Add all the one hour intervals in between
			var times = [];
			while(start < end) {
				times.push(new Date(start));	//Need to copy value
				start.setHours(start.getHours() + 1);
			}

			monthBookings = [...monthBookings, ...times];
		}
	}

	return monthBookings;
}

//value="20170317|09:00-10:00|user|macfhlar|Ronan Macfhlannchadha|bacsb2|"
exports.cancelGlassRoomBooking = function(username, password, room, cancelValue){
	let requestData = `Cancel=${cancelValue}`;

	const options = {
	  protocol: 'https:',
	  host: 'www.scss.tcd.ie',
	  path: `/cgi-bin/webcal/sgmr/sgmr${room}.cancel.pl`,
	  auth: `${username}:${password}`,
	  method: 'POST',
		headers: {
		  "Content-Length": requestData.length,
		  "Content-Type": "application/x-www-form-urlencoded"
		}
	};

	return new Promise((resolve, reject) => {
		try {
			let request = https.request(options, function(res) {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
					let $ = cheerio.load(rawData);
					if($("FONT[COLOR='GREEN']").text().includes("Cancellation Successful"))
						resolve();
					else {
						var errorMessage = "";

						$("FONT[COLOR=RED]").each((index, element) =>
							errorMessage += $(element).text() + "\n");

						reject(errorMessage);
					}
				});
			});
			request.write(requestData);
			request.end();
		} catch(error) {
			reject(error);
		}

	});
}
/**
 * Makes a booking within the glass rooms facility
 * @param {String} username - the user's username used to book the request
 * @param {String} password - the passsword for username
 * @param {String} fullName - the user's name which is displayed to the public
 * @param {Date} date - the date for which the booking is to be made on
 * @param {Number} room - the room number to book
 * @return {Promise} A promise for the request to book a glass room
 */
exports.makeGlassRoomBooking = function(username, password, fullName, date, room) {
	//00:00 is 1, 01:00 is 2, etc.
	let startTime = date.getHours() + 1;
	let endTime = date.getHours() + 2;

	let startDate = date.getDate();
	let startMonth = date.getMonth() + 1;	//Months are zero indexed

	//1 is the current year, 2 is the year after that etc (wot)
	let startYear = date.getFullYear() - new Date().getFullYear() + 1;

	let requestData = `StartTime=${startTime}&EndTime=${endTime}&StartDate=${startDate}&StartMonth=${startMonth}&StartYear=${startYear}&Fullname=${fullName}`;

	const options = {
		protocol: 'https:',
		host: 'www.scss.tcd.ie',
		path: `/cgi-bin/webcal/sgmr/sgmr${room}.request.pl`,
		//args 2 and 3 are the username and password
		auth: `${username}:${password}`,
		method: 'POST',
		headers: {
		  "Content-Length": requestData.length,
		  "Content-Type": "application/x-www-form-urlencoded"
		}
	};

	return new Promise((resolve, reject) => {
		try {
			let request = https.request(options, function(res) {
				let rawData = '';
				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
					let $ = cheerio.load(rawData);

					if($("title").text().includes("Booking Request Successful"))
						resolve();
					else {
						var errorMessage = "";

						$("font[color=RED]").each((index, element) =>
							errorMessage += $(element).text() + "\n");

						reject(errorMessage);
					}
				});
			});
			request.write(requestData);
			request.end();
		} catch(error) {
			reject(error);
		}
	});
}