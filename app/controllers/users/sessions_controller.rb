# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  rate_limit to: 5, within: 1.minute, only: :create,
    by: -> { request.remote_ip },
    with: -> {
      redirect_to new_user_session_path, alert: "Too many login attempts. Please try again later."
    }

  def new
    self.resource = resource_class.new(sign_in_params)
    clean_up_passwords(resource)

    render inertia: "auth/SignIn"
  end

  def create = super

  def destroy = super

  private

  def after_sign_in_path_for(_resource) = root_path

  def after_sign_out_path_for(_resource_or_scope) = root_path
end
