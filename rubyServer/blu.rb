require 'time'
require 'nokogiri'
require 'net/http'
require_relative 'facility'

class BLU < Facility

	def initialize(facility)
		super()
		@facility = facility
	end

	def bookings(date, roomNumbers = @roomCapacities.keys)
		uri = URI.parse "http://tcd-ie.libcal.com/process_roombookings.php?m=showNick&gid=#{@facility}&d=#{dateParam date}"
		doc = Nokogiri::HTML(Net::HTTP.get(uri))

		curRoom = 0

		bookings = Hash[roomNumbers.map {|x| [x, []]}]
		
		for tr in doc.css 'tr'
			if tr.at_css 'th' then
				curRoom = tr.at_css('th').text.match(/Room (\d+)/).captures.first.to_i
			elsif tr.at_css '.s-lc-rm-conf-no' then
				return Hash[roomNumbers.map {|x| [x, []]}]
			else
				startTime = Time.parse tr.at_css('td.s-lc-rm-conf-time').xpath('text()').text, date.to_time
				endTime = Time.parse tr.at_css('td span.s-lc-rm-conf-etime').text.match(/\d+.*/)[0], date.to_time
				name = tr.at_css('.nick_cont').text

				bookings[curRoom] << Booking.new(name, startTime, endTime)
			end
		end

		bookings.reject { |k, v| !roomNumbers.map(&:to_i).include? k }
	end

	def dateParam(date)
		"#{date.year}-#{date.mon.to_s.rjust(2, '0')}-#{date.day}"
	end


	def availableTimes(date, roomNumbers = @roomCapacities.keys)
		uri = URI.parse "http://tcd-ie.libcal.com/rooms_acc.php?gid=#{@facility}&d=#{dateParam date}&cap=0"

		doc = Nokogiri::HTML(Net::HTTP.get(uri))

		day = Time.parse doc.at_css('h1 small').text 

		times = Hash[roomNumbers.map {|x| [x, []]}]

		for fieldset in doc.css('fieldset')[1...-1]
			roomNumber = fieldset.at_css('legend h2').text.match(/Room (\d+)/).captures.first.to_i
			times[roomNumber] = fieldset.css('label').map do |label|
				startTime, endTime = label.text.strip.match(/(.*) - (.*)/).captures.map do |str|
					Time.parse str, day
				end
				AvailableSlot.new(startTime, endTime)
			end
		end

		return times
	end

end

# p BLU.new(14647).bookings(Time.parse('2017-05-29'), 3)
