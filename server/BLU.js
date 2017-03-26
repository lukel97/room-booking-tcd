const Amenities = require('./Amenities');
const helpers = require('./Helpers');
const https = require('https');
const cheerio = require('cheerio');

exports.Facility = {
	BERKELEY: "14647",
	HAMILTON: "14703",
	JOHN_STEARNE: "14704"
}

exports.getAvailableTimes = function(facility, date) {
	let dateParam = date.getFullYear() + "-" + (date.getMonth() + 1).pad(2) + "-" + date.getDate();
	
	return helpers.getPageHttp(`http://tcd-ie.libcal.com/rooms_acc.php?gid=${facility}&d=${dateParam}&cap=0`)
		.then(data => scrapeAvailableTimesBlu(data, date));
}


//--------------------------------------------

function scrapeAvailableTimesBlu(data) {
	let $ = cheerio.load(data);
	var fieldsets = $("fieldset");
	var length = fieldsets.length;
	
	//Get the current day
	let day = new Date($("h1").find("small").text());
	
	var objArr = new Array(); //array of room objects
	//Setup the temp vars for each room
	
	var availTemp = new Object();
	availTemp.room = 0;
	availTemp.times = new Array();
	
	$(fieldsets).each(function(index, element){
		if(index != length - 1 && index != 0) {
			
			let capacityText = $(this).find("legend").find("h2").find("small").text();
			let capacity = parseInt(capacityText.match(/\d+/));
			
			
			var availTimes = $(this).find("label");
			var availableTimes = [];
			
			//iterate over each available time
			$(availTimes).each(function(i, e){
				//Push each time to a temp array
				let time = $(this).text().trim().match(/^(.*) -.*$/)[1];
				
				//Convert 12 hour to 24 hour
				let isPm = time.includes("pm");
				let hour = parseInt(time.match(/\d+/g)[0]);
				if(isPm)
					hour += 12;
				
				let date = new Date(day.getTime());
				date.setHours(hour);
				date.setMinutes(0);
				date.setSeconds(0);
				date.setMilliseconds(0);
				
				availableTimes.push(date);
			});
			
			//Save to the temp object
			let room = {	roomNumber: index,
							availableTimes: availableTimes,
							capacity: capacity,
							amenities: [] };
			
			//clear tempArr
			tempArr = [];
			
			//Push to main array
			objArr.push(room);
		}
	});
	
	//All available times are now in objArr
	
	// ***** FINISHED SCRAPING ******
	
	return objArr;

}