# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require_relative "config/application"

Rails.application.load_tasks

# Update js-routes file before running tests (in subprocess to avoid polluting SimpleCov)
task 'test:prepare' do # rubocop:disable Rails/RakeEnvironment
  sh 'bin/rails js:routes'
end
