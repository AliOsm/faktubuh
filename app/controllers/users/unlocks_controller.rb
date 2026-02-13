# frozen_string_literal: true

class Users::UnlocksController < Devise::UnlocksController
  # GET /users/unlock/new
  def new
    self.resource = resource_class.new
    render inertia: "auth/RequestUnlock"
  end

  # POST /users/unlock
  def create
    self.resource = resource_class.send_unlock_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      redirect_to new_user_session_path, notice: I18n.t("devise.unlocks.send_instructions")
    else
      redirect_to new_user_unlock_path, inertia: { errors: inertia_errors(resource) }
    end
  end

  # GET /users/unlock?unlock_token=abcdef
  def show
    self.resource = resource_class.unlock_access_by_token(params[:unlock_token])
    yield resource if block_given?

    if resource.errors.empty?
      redirect_to new_user_session_path, notice: I18n.t("devise.unlocks.unlocked")
    else
      redirect_to new_user_session_path, alert: I18n.t("devise.unlocks.invalid_token")
    end
  end

  private

  def inertia_errors(resource)
    resource.errors.to_hash(true).transform_values(&:first)
  end
end
