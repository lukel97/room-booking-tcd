ENV['RACK_ENV'] = 'test'

require 'rack/test'
require 'time'
require 'test/unit'
require 'webmock/test_unit'
require_relative '../server'
require_relative '../blu'

class TestBLU < Test::Unit::TestCase

	def setup
		WebMock.stub_request(:get, "http://tcd-ie.libcal.com/rooms_acc.php?cap=0&d=2017-05-30&gid=14647").
			to_return(status: 200, body: File.open("#{__dir__}/results/berkeley2017-05-30.html.stub"))

		WebMock.allow_net_connect!
	end

	include Rack::Test::Methods

	@@facility = BLU.new 14647 do |f|
		f.name = 'Berkeley'
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
		assert_equal bookings[1].length, 7
		assert_equal bookings[1][1].name, 'Group project'
		assert_equal bookings[1][1].startTime, Time.parse("2017-03-10 11:00:00 +0000")
		assert_equal bookings[1][1].endTime, Time.parse("2017-03-10 12:00:00 +0000")
		assert_equal @@facility.roomCapacities.keys.length, bookings.length
	end

	def testGetBookings
		get '/facility/berkeley/bookings', :date => '2017-04-12'
		assert_equal File.read("#{__dir__}/results/berkeleyBookings2017-04-12.json").strip, last_response.body
	end

	def testGetNoBookings
		get '/facility/berkeley/bookings', :date => '2017-04-15'
		assert_equal  File.read("#{__dir__}/results/berkeleyBookings2017-04-15.json").strip, last_response.body
	end

	def testAvailableTimes
		availableTimes = @@facility.availableTimes Date.parse('2017-05-30')
		assert_equal @@facility.roomCapacities.keys.length, availableTimes.length
		assert_equal availableTimes[1][0].startTime, Time.parse('2017-05-30 09:00:00 +0100')
		assert_equal availableTimes[1][0].endTime, Time.parse('2017-05-30 10:00:00 +0100')
	end

end
