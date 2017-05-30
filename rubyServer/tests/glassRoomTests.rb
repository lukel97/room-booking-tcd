ENV['RACK_ENV'] = 'test'

require 'rack/test'
require 'time'
require 'test/unit'
require 'webmock/test_unit'
require '../server'
require '../glassRooms'

WebMock.stub_request(:get, "http://tcd-ie.libcal.com/rooms_acc.php?cap=0&d=2017-05-30&gid=14647").
	to_return(status: 200, body: File.open('results/berkeley2017-05-30.html.stub'))

WebMock.allow_net_connect!

class GlassRoomTests < Test::Unit::TestCase

	include Rack::Test::Methods

	@@facility = GlassRooms.new do |f|
		f.name = 'Glass Rooms'
		f.roomCapacities = {
			1 => 6,
			2 => 6,
			3 => 6,
			4 => 6,
			5 => 6,
			6 => 6,
			7 => 7,
			8 => 6,
			9 => 9
		}
	end

	def app
    Sinatra::Application
  end

	def testBookings
		bookings = @@facility.bookings Date.parse('2017-03-10')

		bookings.each { |k, bs| bs.each { |b| assert_kind_of Booking, b } }
		assert_equal 5, bookings[1].length
		assert_equal 'Rory Goodman', bookings[1][1].name
		assert_equal 'Daniel John George Owen', bookings[9][3].name
		assert_equal Time.parse("2017-03-10 12:00:00 UTC"), bookings[1][1].startTime 
		assert_equal Time.parse("2017-03-10 14:00:00 UTC"), bookings[1][1].endTime
		assert_equal @@facility.roomCapacities.keys.length, bookings.length
	end

	def testGetBookings
		get '/facility/glass-rooms/bookings', :date => '2017-03-09'
		assert_equal File.read('results/glassRoomsBookings2017-03-09.json').strip, last_response.body
	end

	def testAvailableTimes
		availableTimes = @@facility.availableTimes Date.parse('2017-03-05')
		assert_equal @@facility.roomCapacities.keys.length, availableTimes.length
		assert_equal 21, availableTimes[9].length
		assert_equal Time.parse('2017-03-05 00:00:00 +0000'), availableTimes[3][0].startTime
		assert_equal Time.parse('2017-03-05 01:00:00 +0000'), availableTimes[3][0].endTime
	end

	def testGetAvailableTimes
		get '/facility/glass-rooms/availableTimes', :date => '2017-03-10'
		assert_equal File.read('results/glassRoomsAvailableTimes2017-03-10.json').strip, last_response.body
	end

end
