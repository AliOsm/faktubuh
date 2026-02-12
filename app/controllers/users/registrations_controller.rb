# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  def new
    build_resource

    render inertia: "auth/SignUp", props: { locale: I18n.locale.to_s }
  end

  def create = super

  private

  def after_sign_up_path_for(_resource) = root_path

  def after_failure_path_for(_resource) = new_user_registration_path

  def inertia_errors(resource)
    resource.errors.to_hash(true).transform_values { |msgs| msgs.first }
  end

  def sign_up_params
    params.require(:user).permit(:full_name, :email, :password, :password_confirmation)
  end
end
