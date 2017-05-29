require 'sinatra'
require 'graphql'
require 'net/https'
require_relative 'facility'
require_relative 'glassRooms'
require_relative 'blu'

# read in environment variables in .env
File.foreach '.env' do |line|
	key, value = line.chomp.split '='
	ENV[key] = value
end if File.file? '.env'

$glassRooms = GlassRooms.new do |f|
	f.name = 'Glass Rooms'
	f.longitude = 84.1234
	f.latitude = 85.1324
	f.roomCapacities = {
		1 => 6,
		2 => 6,
		3 => 4,
		4 => 6,
		5 => 6,
		6 => 6,
		7 => 6,
		8 => 6,
		9 => 6
	}
end

$hamilton = Facility.new do |f|
	f.name = 'Hamilton'
	f.longitude = 84.1234
	f.latitude = 85.1324
end

$berkeley = BLU.new 14647 do |f|
	f.name = 'Berkeley'
	f.longitude = 84.1234
	f.latitude = 85.1324
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

$stearne = Facility.new do |f|
	f.name = 'John Stearne'
	f.longitude = 84.1234
	f.latitude = 85.1324
end

$facilities = [$glassRooms, $hamilton, $berkeley, $stearne]

FacilityType = GraphQL::ObjectType.define do
	name 'Facility'
	description 'A facility that offers rooms that can be booked'
	field :id, !types.ID
	field :name, !types.String
	field :room, RoomType do
		argument :roomNumber, !types.Int
		resolve -> (obj, args, ctx) {
			{
				:facility => obj,
				:capacity => obj.roomCapacities[args[:roomNumber]],
				:roomNumber => args[:roomNumber]
			}
		}
	end
	field :allRooms, types[RoomType] do
		argument :minCapacity, types.Int	
		resolve -> (obj, args, ctx) {
			rooms = obj.roomCapacities.map do |roomNumber, capacity|
				{
					:facility => obj,
					:capacity => capacity,
					:roomNumber => roomNumber
				}
			end
			
			if args[:minCapacity]
				rooms.reject { |r| r.capacity < args[:minCapacity] }
			else
				rooms
			end
		}
	end
end

RoomType = GraphQL::ObjectType.define do
	name 'Room'
	field :roomNumber, !types.Int do
		resolve -> (obj, args, ctx) {
			obj[:roomNumber]
		}
	end
	field :capacity, !types.Int do
		resolve -> (obj, args, ctx) {
			obj[:capacity]
		}
	end
	field :bookings, types[BookingType] do
		argument :date, !types.String
		resolve -> (obj, args, ctx) {
			obj[:facility].bookings(Date.parse(args[:date]), [obj[:roomNumber]])[obj[:roomNumber]]
		}
	end
end

BookingType = GraphQL::ObjectType.define do
	name 'Booking'
	description 'A booking that a user has made within a facility'
	field :name, !types.String, 'The name of the user who booked the facility'
	field :startTime, !types.String
	field :endTime, !types.String
end

QueryType = GraphQL::ObjectType.define do
	name 'Query'
	description 'The query root of this schema'

	field :allFacilities do
		type types[FacilityType]
		description 'Get all facilities'
		resolve -> (obj, args, ctx) { $facilities }
	end
	
	field :facility do
		type FacilityType
		description 'Get a facility by name'
		argument :name, !types.String
		resolve -> (obj, args, ctx) {
			$facilities.reject { |f| f.urlName != args[:name] }.first
		}
	end
end

Schema = GraphQL::Schema.define do
	query QueryType
end

get '/graphql' do
	Schema.execute(params['query']).to_json
end

post '/graphql' do
	Schema.execute(request.body.read).to_json
end

before do
	content_type 'application/json'
end

get '/facility' do
	$facilities.to_json
end

get '/facility/:name' do |name|
	$facilities.find { |f| f.urlName == name }.to_json
end

get '/facility/:name/availableTimes' do |name|
	facility = $facilities.find { |f| f.urlName == name }

	return [status(400), "You didn't supply a date query\n"] if !params.has_key? 'date'
	begin
		date = Date.parse(params['date'])
	rescue ArgumentError
		return [status(400), "You supplied an invalid date\n"]
	end

	facility.availableTimes(date).to_json
end

get '/facility/:name/bookings' do |name|
	facility = $facilities.find { |f| f.urlName == name }
	
	return [status(400), "You didn't supply a date query\n"] if !params.has_key? 'date'
	begin
		date = Date.parse(params['date'])
	rescue ArgumentError
		return [status(400), "You supplied an invalid date\n"]
	end
	
	facility.bookings(date).to_json
end

get '/facility/:name/room/:room/bookings' do |name, roomNumber|
	facility = $facilities.find { |f| f.urlName == name }

	return [status(400), "You didn't supply a date query\n"] if !params.has_key? 'date'
	begin
		date = Date.parse(params['date'])
	rescue ArgumentError
		return [status(400), "You supplied an invalid date\n"]
	end

	facility.bookings(date, [roomNumber]).to_json
end

