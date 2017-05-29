require 'net/https'
require 'date'
require 'time'
require 'nokogiri'
require_relative 'facility'

class GlassRooms < Facility
	def bookings(date, roomNumbers = @roomCapacities.keys)
		bookings = {}
		threads = []
		for roomNumber in roomNumbers
			threads << Thread.new(roomNumber) do |roomNumber|
				bookings[roomNumber] = bookingsForRoom date, roomNumber
			end
		end

		threads.each(&:join)

		bookings
	end

	def availableTimes(date, roomNumbers = @roomCapacities.keys)
		bookings = bookings date, roomNumbers
		roomNumbers.map do |roomNumber|
			(0..23).map { |t| Time.parse "#{t}:00", date.to_time }.reject { |time|
				bookings[roomNumber].map(&:startTime).include? time
			}.map { |startTime| AvailableSlot.new(startTime, startTime + 60 * 60) }
		end
	end

	def bookingsForRoom date, roomNumber
		requestData = "Month=#{date.mon}&Year=#{date.year}"
		uri = URI.parse "https://scss.tcd.ie/cgi-bin/webcal/sgmr/sgmr#{roomNumber}.pl"

		http = Net::HTTP.start uri.host, uri.port,
			:use_ssl => true do |http|
			req = Net::HTTP::Post.new uri.request_uri
			req.set_form_data('Month' => date.mon, 'Year' => date.year)
			req.basic_auth ENV['scssUsername'], ENV['scssPassword']

			doc = Nokogiri::HTML(http.request(req).body)

			fonts = doc.css("table[border!='3']", "table[cellpadding='3']").css('font')

			currentDate = Date.today
			bookings = []

			datePattern = /\d+ \w+ \d+/
			bookingPattern = /(\d\d):(\d\d)-(\d\d):(\d\d) (.+) \[.+\]/

			for font in fonts.map(&:inner_html).flat_map{|f|f.split('<br>')} do
				if font.match datePattern then
					currentDate = Date.parse font.match(datePattern)[0]
				elsif font.match bookingPattern
					matches = font.match bookingPattern
					startTime = Time.gm(currentDate.year, currentDate.month, currentDate.day, matches[1].to_i, matches[2].to_i)
					endTime = Time.gm(currentDate.year, currentDate.month, currentDate.day, matches[3].to_i, matches[4].to_i)
					bookings << Booking.new(matches[5], startTime, endTime)
				end
			end
			return bookings.reject { |b| b.startTime.to_date != date }
		end
	end
end
