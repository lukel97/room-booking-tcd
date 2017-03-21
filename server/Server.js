const express = require('express');
const bodyParser = require('body-parser');
const glassRooms = require('./GlassRooms');
const app = express();
const helpers = require('./Helpers');

app.use(bodyParser.json());

app.post('/facility/:name/room/:room/book', (req, res) => {
	let date = new Date(req.body.date);
	let username = req.body.username;
	let password = req.body.password;
	let fullName = req.body.fullName;
	glassRooms.makeGlassRoomBooking(username, password, fullName, date, req.params.room)
		.then((value) => res.end("success"), (error) => res.end(error));
});

app.post('/facility/:name/room/:room/cancel', (req,res) =>{
	let username = req.body.username;
	let password = req.body.password;
	
	//Get the values we need to submit back to the website in order to cancel the bookings
	glassRooms.getMyGlassRoomBookings(username, password, true, req.params.room)
		.then(result => result.bookings)
		//Wait for all bookings for that room to be cancelled
		.then(cancelValues => Promise.all(cancelValues.map((value => glassRooms.cancelGlassRoomBooking(username, password, req.params.room, value)))))
		//Then reply to the client
		.then(() => res.end("success")).catch((error) => {
			res.end();
			console.log(error);
		});
});

app.get('/facility/:name/bookings', (req, res) => {
	//🚨 Dodgy - dont' recommend 🚨
	let username = req.query.username;
	let password = req.query.password;

	Promise.all(helpers.range(1, 9).map(glassRooms.getMyGlassRoomBookings.bind(null, username, password)))
			.then(times => times.filter(x => x.bookings.length > 0))
			.then(times => times.flatten())
			.then(times => res.end(JSON.stringify(times)), error => res.end("oops"));
});

app.get('/facility/:name/', (req, res) => {
	let date = new Date(req.query.date);
	//Return the times for all the rooms
	Promise.all(helpers.range(1, 9).map(glassRooms.getGlassRoomTimes.bind(null, date)))
		.then(times => res.end(JSON.stringify(times)))
		.catch(error => console.log);
});

const server = app.listen(4000, () => {
  var host = server.address().address
  var port = server.address().port

  console.log("Listening at http://%s:%s", host, port)
});


//--------------------------------------------

function scrapeAvailableTimesBlu(data) {
  var document_root = data;

  // ***** START SCRAPING THE HTML ******
  var object = $('<div/>').html(document_root).contents();

  var fieldsets = object.find("fieldset");
  var length = fieldsets.length;


  var objArr = new Array(); //array of room objects

  //Setup the temp vars for each room
  var tempArr = new Array(); //Temp array to handle js pointers
  var availTemp = new Object();
  availTemp.room = 0;
  availTemp.times = new Array();

  $(fieldsets).each(function(index, element){

    if(index != length - 1 && index != 0) {
      //console.log($(this).text());
      var h2 = $(this).find("h2");
      $(h2).children().remove().text();
      //console.log(h2.text());
      var availTimes = $(this).find("label");

      //iterate over each available time
      $(availTimes).each(function(i, e){
        //Push each time to a temp array
        tempArr.push($(this).text().trim());
      });

      //Save to the temp object
      availTemp = {room:index, times:tempArr};

      //clear tempArr
      tempArr = [];

      //Push to main array
      objArr.push(availTemp);
    }
  });

  console.log(objArr);

  //All available times are now in objArr

  // ***** FINISHED SCRAPING ******

}
