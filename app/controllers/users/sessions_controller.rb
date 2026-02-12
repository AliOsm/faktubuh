# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  def new
    self.resource = resource_class.new(sign_in_params)
    clean_up_passwords(resource)

    render inertia: "auth/SignIn", props: { locale: I18n.locale.to_s }
  end

  def create = super

  def destroy = super

  private

  def after_sign_in_path_for(_resource) = root_path

  def after_sign_out_path_for(_resource_or_scope) = new_user_session_path
end
