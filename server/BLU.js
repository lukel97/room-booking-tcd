const Amenities = require('./Amenities');
const helpers = require('./Helpers');
const https = require('https');
const cheerio = require('cheerio');

exports.Facility = {
	BERKELEY: "14647",
	HAMILTON: "14703",
	JOHN_STEARNE: "14704"
}

// http://tcd-ie.libcal.com/process_roombookings.php?m=booking_mob
// fid	7351
// qcount	1
// q1	undergraduate?
// nick	Name
// email	laulu@tcd.ie
// lname	Lau
// fname	Luke
// t_sch529427614	Room 1 9:00pm - 10:00pm Monday, March 27, 2017
// dur529427614	60
// sid[]	529427614
// t_sch529427613	Room 1 8:00pm - 9:00pm Monday, March 27, 2017
// dur529427613	60
// t_sch529427612	Room 1 7:00pm - 8:00pm Monday, March 27, 2017
// dur529427612	60
// t_sch529427602	Room 1 9:00am - 10:00am Monday, March 27, 2017
// dur529427602	60
// gid	14703

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