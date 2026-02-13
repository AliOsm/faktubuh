# frozen_string_literal: true

class Users::ConfirmationsController < Devise::ConfirmationsController
  # GET /users/confirmation/new
  def new
    self.resource = resource_class.new
    render inertia: "auth/ResendConfirmation"
  end

  # POST /users/confirmation
  def create
    self.resource = resource_class.send_confirmation_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      redirect_to new_user_session_path, notice: I18n.t("devise.confirmations.send_instructions")
    else
      redirect_to new_user_confirmation_path, inertia: { errors: inertia_errors(resource) }
    end
  end

  # GET /users/confirmation?confirmation_token=abcdef
  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    yield resource if block_given?

    if resource.errors.empty?
      sign_in(resource_name, resource)
      redirect_to after_confirmation_path_for(resource_name, resource),
                  notice: I18n.t("devise.confirmations.confirmed")
    else
      redirect_to new_user_session_path, alert: I18n.t("devise.confirmations.invalid_token")
    end
  end

  protected

  def after_confirmation_path_for(_resource_name, _resource)
    root_path
  end

  private

  def inertia_errors(resource)
    resource.errors.to_hash(true).transform_values(&:first)
  end
end
