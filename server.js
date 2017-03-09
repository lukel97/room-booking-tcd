const https = require('https');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

/**
 * Returns an array of integers within the specified range
 */
function range(begin, end, interval = 1) {
	var array = [];
	for(let i = begin; i < end; i += interval) {
		array.push(i);
	}
	return array;
}

Array.prototype.flatten = function() {
	return this.reduce((array, x) => array.concat(x), []);
}

app.get('/facilities/:name/bookings', (req, res) => {
	
	//🚨 Dodgy - dont' recommend 🚨
	let username = req.query.username;
	let password = req.query.password;

	Promise.all(range(1, 9).map(getMyGlassRoomBookings.bind(null, username, password)))
			.then(times => times.filter(x => x.bookings.length > 0))
			.then(times => times.flatten())
			.then(times => res.end(JSON.stringify(times)), error => res.end("oops"));
});

app.get('/facilities/:name/', (req, res) => {
	let date = new Date(req.query.date);
	//Return the times for all the rooms
	Promise.all(range(1, 9).map(getGlassRoomTimes.bind(null, date))).then(times => {
		res.end(JSON.stringify(times));
	}, error => res.end("oops"));
});

const server = app.listen(4000, () => {
  var host = server.address().address
  var port = server.address().port

  console.log("Listening at http://%s:%s", host, port)
});

function getMyGlassRoomBookings(username, password, room) {
	const options = {
	  protocol: 'https:',
	  host: 'www.scss.tcd.ie',
	  path: `https://www.scss.tcd.ie/cgi-bin/webcal/sgmr/sgmr${room}.cancel.pl`,
	  //args 2 and 3 are the username and password
	  auth: `${username}:${password}`
	};
	
	return new Promise((resolve, reject) => {
		https.get(options, function(res) {
			let rawData = '';
			res.on('data', (chunk) => rawData += chunk);
			res.on('end', () => {
				try {
					resolve({
						roomNumber: room,
						bookings: parseMyGlassRoomBookings(rawData)
					});
				} catch(e) {
					reject(e)
				}
			});
		});
	})
	
}

function parseMyGlassRoomBookings(data) {
	let $ = cheerio.load(data);
	
	let form = $("form[action='/cgi-bin/webcal/sgmr/sgmr3.cancel.pl']");
	let strings = form.find("input[type='CHECKBOX']").map((i, e) => $(e).val()).get();
	
	let bookings = strings.map(s => {
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

function getGlassRoomTimes(date, room) {
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
		let request = https.request(options, function(res) {
			let rawData = '';
			res.on('data', (chunk) => rawData += chunk);
			res.on('end', () => {
				try {
					resolve({
						roomNumber: room,
						capacity: getRoomCapacity(rawData),
						bookings: scrapeBookedTimesGlassrooms(rawData).filter(isToday.bind(null, date))
					});
				} catch(e) {
					reject(e)
				}
			});
		});
		
		request.write(requestData);
		request.end();
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