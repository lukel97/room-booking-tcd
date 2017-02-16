
<?php
/*

USING PHP AS A TEMP FIX FOR CROSS-ORIGIN ERRORS IN AJAX

It would be nice to be able to do all this in js so feel free in finding
replacement code for this


*************************
SEE JS CONSOLE FOR OUTPUT
*************************


*************************************
ENTER YOUR USERNAME AND PASSWORD HERE
*************************************
*/
$usr = "";
$psd = "";






// Get cURL resource
$curl = curl_init();
// Set some options - we are passing in a useragent too here
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => 'https://'.$usr.':'.$psd.'@www.scss.tcd.ie/cgi-bin/webcal/sgmr/sgmr1.pl',
    CURLOPT_USERAGENT => 'Codular Sample cURL Request'
));
// Send the request & save response to $response
$response = curl_exec($curl);

// Close request to clear up some resources
curl_close($curl);
?>


<script src = "jquery.js"> </script>

<script>

    var document_root = <?php echo json_encode($response); ?>;

    // ***** START SCRAPING THE HTML ******
    var object = $('<div/>').html(document_root).contents();

    var excludeTable = object.find("table[border!='3']");
    var tableObj = excludeTable.filter("table[cellpadding='3']");

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

    //Initilase temp object holders
    var tempDay = new Object();
    tempDay.times = new Array();

    //Array of final objects
    var monthsBookings = new Array();

    //Get current year to determine if array entry is a date
    var currentYear = new Date().getFullYear();

    var firstFound = false;
    //Loop through entire array, checking for dates and booking times
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].indexOf(currentYear) != -1) {
        //This index is potentially a date
        var endOfDate = arr[i].indexOf("(");
        if(endOfDate != -1) {
          //Check if it's the first iteration
          var date = arr[i].substring(0, endOfDate);
          if(!firstFound) {
            firstFound = true;
            tempDay.date = date;
          }
          else {
            //Else we push the previous iterations
            monthsBookings.push(tempDay);
            tempDay = {};
            tempDay.times = new Array();
            tempDay.date = date;
          }
        }
      }
      else {
        //It's a booking
        var time = arr[i].substring(0, 11);  // Just presuming this is in correct (THIS SHOULD BE CHECKED)
        tempDay.times.push(time);
      }
    }

    console.log(monthsBookings);

</script>
