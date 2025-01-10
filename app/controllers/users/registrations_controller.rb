class Users::RegistrationsController < Devise::RegistrationsController
  skip_before_action :user_information_confirmed?, only: [ :edit, :update ]

  def edit
    render inertia: "Users/Edit"
  end

  def update
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    prev_unconfirmed_email = resource.unconfirmed_email if resource.respond_to?(:unconfirmed_email)

    resource.information_confirmed = true

    resource_updated = update_resource(resource, account_update_params.except(:email))
    yield resource if block_given?
    if resource_updated
      set_flash_message_for_update(resource, prev_unconfirmed_email)
      bypass_sign_in resource, scope: resource_name if sign_in_after_change_password?

      redirect_to edit_user_registration_path, notice: t("user_information_updated")
    else
      clean_up_passwords resource
      set_minimum_password_length
      redirect_to edit_user_registration_path, inertia: { errors: resource.errors }
    end
  end

  protected

  def update_resource(resource, params)
    resource.update_without_password(params)
  end
end
