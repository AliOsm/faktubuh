class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  # allow_browser versions: :modern

  inertia_share flash: -> { flash.to_hash }
  inertia_share current_user: -> { current_user&.attributes&.slice("email", "first_name", "last_name", "role", "information_confirmed") }

  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :user_information_confirmed?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:account_update, keys: %i[first_name last_name])
  end

  private

  def user_information_confirmed?
    redirect_to edit_user_registration_path, notice: t("user_information_not_confirmed") if user_signed_in? && !current_user.information_confirmed
  end
end
