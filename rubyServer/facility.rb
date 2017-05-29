require 'json'

class Facility
	def initialize
		yield self if block_given?
	end

	def urlName
		return @name.downcase.sub ' ', '-'
	end

	def to_json(*a)
		{
			'name' => @name,
			'latitude' => @latitude,
			'longitude' => @longitude
		}.to_json(*a)
	end

	def bookings(date, roomNumbers)
		throw NotImplementedError
	end

	def availableTimes(date, roomNumbers)
		throw NotImplementedError
	end

	attr_accessor :name, :latitude, :longitude, :roomCapacities
end

class Booking
	def initialize(name, startTime, endTime)
		@name = name
		@startTime = startTime
		@endTime = endTime
	end
	
	def to_json(*a)
		{
			'name' => @name,
			'startTime' => @startTime.to_s,
			'endTime' => @endTime.to_s
		}.to_json(*a)
	end
	
	attr_accessor :name, :startTime, :endTime
end

class AvailableSlot
	def initialize(startTime, endTime)
		@startTime = startTime
		@endTime = endTime
	end
	
	def to_json(*a)
		{
			'startTime' => @startTime.to_s,
			'endTime' => @endTime.to_s
		}.to_json(*a)
	end
	
	attr_accessor :startTime, :endTime
end
