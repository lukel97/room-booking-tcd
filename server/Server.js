const express = require('express');
const bodyParser = require('body-parser');
const glassRooms = require('./GlassRooms');
const Keen = require('keen-js');
const blu = require('./BLU');
const app = express();
const read = require('read');
const path = require('path');
const helpers = require('./Helpers');

var keen = new Keen({
	projectId: process.env['KEEN_PROJECT_ID'],
	writeKey: process.env['KEEN_WRITE_KEY']
});

var username = "";
var password = "";

app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.post('/facility/:facility/room/:room/book', (req, res) => {
	let date = new Date(req.body.date);
	let username = req.body.username;
	let password = req.body.password;
	
	let givenName = req.body.givenName;
	let familyName = req.body.familyName;
	let fullName = req.body.fullName;
	
	let email = req.body.email;
	const bookingEvent = {
		"fullName": fullName,
		"facility": req.params.facility,
		"date": date
	};
	

	let bookingPromise;
	
	switch(req.params.facility) {
		case "glass-rooms":
			bookingPromise = glassRooms.makeGlassRoomBooking(username, password, fullName, date, req.params.room);
			break;
		case "berkeley":
			bookingPromise = blu.makeBooking(givenName, familyName, email, blu.Facility.BERKELEY, date, req.params.room);
			break;
		case "hamilton":
			bookingPromise = blu.makeBooking(givenName, familyName, email, blu.Facility.HAMILTON, date, req.params.room);
			break;
		case "john-stearne":
			bookingPromise = blu.makeBooking(givenName, familyName, email, blu.Facility.JOHN_STEARNE, date, req.params.room);
			break;
		default:
			res.end("Not a valid facility");
	}

	bookingPromise.then(response => res.end(JSON.stringify(response)))
		.then(() => {
			keen.addEvent("bookings", bookingEvent, (err, res) => {
				if(err) console.log(err);
			});
		})
		.catch(error => {
			console.log(error);
			res.end("Internal server error");
		});
	
});

app.post('/facility/:name/room/:room/cancel', (req,res) =>{
	let username = req.query.username;
	let password = req.query.password;
	
	//Get the values we need to submit back to the website in order to cancel the bookings
	glassRooms.getMyGlassRoomBookings(username, password, true, req.params.room)
		.then(result => result.bookings)
		//Wait for all bookings for that room to be cancelled
		.then(cancelValues => Promise.all(cancelValues.map((value => glassRooms.cancelGlassRoomBooking(username, password, req.params.room, value)))))
		//Then reply to the client
		.then(() => {
			res.end("success");
			const cancelData = {
				"facility": req.params.name,
				"room": req.params.room
			};
			keen.addEvent("cancellings", cancelData, (err, res) => {
				if(err)	console.log(err);
			});
		}).catch((error) => {
			res.end();
			console.log(error);
		});
});

app.get('/facility/:name/bookings', (req, res) => {
	//🚨 Dodgy - dont' recommend 🚨
	let username = req.query.username;
	let password = req.query.password;

	Promise.all(helpers.range(1, 9).map(glassRooms.getMyGlassRoomBookings.bind(null, username, password, false)))
			.then(times => times.filter(x => x.bookings.length > 0))
			.then(times => times.flatten())
			.then(times => res.end(JSON.stringify(times)), error => res.end("oops"));
});

app.get('/facility/:name/availableTimes', (req, res) => {
	if(!req.query.date) {
		res.end("Need to supply a date");
		return;
	}
	let date = new Date(req.query.date);
	//Clean up the date
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	
	switch(req.params.name) {
		case "glass-rooms":
			//Return the times for all the rooms
			Promise.all(helpers.range(1, 9).map(glassRooms.getAvailableTimes.bind(null, date, username, password)))
				.then(times => res.end(JSON.stringify(times)))
				.catch(error => console.log);
			break;
		case "berkeley":
			blu.getAvailableTimes(blu.Facility.BERKELEY, date)
				.then(times => res.end(JSON.stringify(times)))
				.catch(res.end);
			break;
		case "hamilton":
			blu.getAvailableTimes(blu.Facility.HAMILTON, date)
				.then(times => res.end(JSON.stringify(times)))
				.catch(res.end);
			break;
		case "john-stearne":
			blu.getAvailableTimes(blu.Facility.JOHN_STEARNE, date)
				.then(times => res.end(JSON.stringify(times)))
				.catch(res.end);
			break;
		default:
			res.end("Not a valid facility");
	}
	
});

username = process.env.scssUsername;
password = process.env.scssPassword;
if(username === undefined || password === undefined) {
	read({ prompt: 'SCSS username: '}, (error, promptUsername) => {
		read({ prompt: 'SCSS password: ', silent: true }, (error, promptPassword) => {
			username = promptUsername;
			password = promptPassword;
			startServer();
		});
	});
} else {
	startServer();
}


function startServer() {	
	let port = process.env.PORT || 4000;
	const server = app.listen(port, () => {
		var host = server.address().address
		var port = server.address().port

		console.log("Listening at http://%s:%s", host, port)
	});
}

app.get('*', function (req, res) {
	res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
