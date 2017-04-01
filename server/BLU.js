const Amenities = require('./Amenities');
const helpers = require('./Helpers');
const https = require('https');
const cheerio = require('cheerio');

exports.Facility = {
	BERKELEY: "14647",
	HAMILTON: "14703",
	JOHN_STEARNE: "14704"
}

const blueAmenities = {
	//Berkeley
	"14647": {	1: [],
				2: [],
				3: [],
				4: [],
				5: [Amenities.LAPTOP, Amenities.SMART_BOARD],
				6: [Amenities.LAPTOP, Amenities.SMART_BOARD],
				7: [],
				8: [],
				9: [] },
	"14703": { 1: [] },
	//John Stearne
	"14704": { 	1: [],
				2: [Amenities.LAPTOP],
				3: [] }
};

exports.makeBooking = function(firstName, lastName, email, facility, date, roomNumber) {
	let dateParam = date.getFullYear() + "-" + (date.getMonth() + 1).pad(2) + "-" + date.getDate();
	

	let getOptions = {
		host: "tcd-ie.libcal.com",
		path: `/rooms_acc.php?gid=${facility}&d=${dateParam}&cap=0`,
		headers: {
			"Upgrade-Insecure-Requests":	"1",
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
		}
	};
	
	return helpers.getPageHttp(getOptions, true)
		.then(response => {
			let cookies = response.headers["set-cookie"].map(cookie => cookie.split(";")[0]);
			
			let $ = cheerio.load(response.data);
			
			let room = $("fieldset").filter((index, element) => {
				let label = $(element).find("legend").find("h2");
				
				if(label.text().match(/Room (\d+)/) == null)
					return false;
					
				return label.text().match(/Room (\d+)/)[1] === roomNumber;
			}).first();

			let label = room.find("label").filter((index, element) => {
				if($(element).find("input:checkbox").length <= 0)
					return false;
				
				return getTimeFromLabel($(element).text(), date).getTime() === date.getTime();
			}).first();
			
			label.find("input:checkbox").attr("checked", true);
			
			$("input[name='fname']").val(firstName);
			$("input[name='lname']").val(lastName);
			$("input[name='email']").val(email);
			$("select[name='q1']").val("undergraduate?");
			$("input[name='nick']").val("");

			let postData = $("#roombookingform").serialize();

			let postOptions = {
				host: "tcd-ie.libcal.com",
				path: "/process_roombookings.php?m=booking_mob",
				headers: {
					"Content-Type":	 "application/x-www-form-urlencoded; charset=UTF-8",
					"Origin": "http://tcd-ie.libcal.com",
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30",
					"Accept": "application/json, text/javascript, */*; q=0.01",
					"Referer":	`http://tcd-ie.libcal.com/rooms_acc.php?gid=${facility}&d=${dateParam}&cap=0`,
					"X-Requested-With": "XMLHttpRequest",
					"Cookie": cookies.join(";")
				}
			};
			return helpers.postHttp(postData, postOptions);
		})
		.then(data => {
			let response = JSON.parse(data);
			if(response.status !== 2) {
				let errorMessage = response.msg;
				if(response.msg.includes("Error - No time slots selected"))
					errorMessage = "The room is no longer available at this time."
				return Promise.resolve({success: false, message: errorMessage});
			}
			return Promise.resolve({success: true, message: response.msg});
		});
}

exports.getAvailableTimes = function(facility, date) {
	let dateParam = date.getFullYear() + "-" + (date.getMonth() + 1).pad(2) + "-" + date.getDate();
	
	return helpers.getPageHttp(`http://tcd-ie.libcal.com/rooms_acc.php?gid=${facility}&d=${dateParam}&cap=0`)
		.then(data => scrapeAvailableTimesBlu(data, facility));
}

function getTimeFromLabel(label, day) {
	let time = label.trim().match(/^(.*) -.*$/)[1];
	
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
	
	return date;
}


//--------------------------------------------

function scrapeAvailableTimesBlu(data, facility) {
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
				availableTimes.push(getTimeFromLabel($(this).text(), day));
			});
			
			//Save to the temp object
			let room = {	roomNumber: index,
							availableTimes: availableTimes,
							capacity: capacity,
							amenities: blueAmenities[facility][index] };
			
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