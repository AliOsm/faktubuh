# frozen_string_literal: true

class Users::PasswordsController < Devise::PasswordsController
  # GET /users/password/new
  def new
    self.resource = resource_class.new
    render inertia: "auth/ForgotPassword"
  end

  # POST /users/password
  def create
    self.resource = resource_class.send_reset_password_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      redirect_to new_user_session_path, notice: I18n.t("devise.passwords.send_instructions")
    else
      redirect_to new_user_password_path, inertia: { errors: inertia_errors(resource) }
    end
  end

  # GET /users/password/edit?reset_password_token=abcdef
  def edit
    self.resource = resource_class.new
    resource.reset_password_token = params[:reset_password_token]
    render inertia: "auth/ResetPassword", props: {
      reset_password_token: params[:reset_password_token]
    }
  end

  # PUT /users/password
  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      if Devise.sign_in_after_reset_password
        flash_message = resource.active_for_authentication? ? :updated : :updated_not_active
        sign_in(resource_name, resource)
        redirect_to after_resetting_password_path_for(resource), notice: I18n.t("devise.passwords.#{flash_message}")
      else
        redirect_to new_user_session_path, notice: I18n.t("devise.passwords.updated_not_active")
      end
    else
      redirect_to edit_user_password_path(reset_password_token: params[:user][:reset_password_token]),
                  inertia: { errors: inertia_errors(resource) }
    end
  end

  protected

  def after_resetting_password_path_for(_resource)
    root_path
  end

  private

  def inertia_errors(resource)
    resource.errors.to_hash(true).transform_values(&:first)
  end
end
