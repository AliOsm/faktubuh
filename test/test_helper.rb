require "simplecov"

if ENV["NO_COVERAGE"].blank?
  SimpleCov.enable_coverage :branch
  SimpleCov.minimum_coverage line: 95, branch: 90

  SimpleCov.start "rails"
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "inertia_rails/minitest"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Configure SimpleCov to merge coverage results from parallel workers
    if ENV["NO_COVERAGE"].blank?
      parallelize_setup do |worker|
        SimpleCov.command_name "#{SimpleCov.command_name}-#{worker}"
      end

      parallelize_teardown do |_worker|
        SimpleCov.result
      end
    end

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Set default locale to English for all tests
    setup do
      I18n.locale = :en
    end

    # Add more helper methods to be used by all tests here...
  end
end
