# frozen_string_literal: true

InertiaRails.configure do |config|
  config.version = ViteRuby.digest
  config.use_script_element_for_initial_page = true
  config.parent_controller = "::InertiaController"
  config.always_include_errors_hash = true
end
