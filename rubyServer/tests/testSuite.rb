require 'test/unit'
require 'simplecov'
SimpleCov.start
require 'codecov'
SimpleCov.formatter = SimpleCov::Formatter::Codecov
require_relative 'bluTests'
require_relative 'glassRoomTests'
