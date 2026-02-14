# frozen_string_literal: true

class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token, only: [ :google_oauth2 ]

  def google_oauth2
    user = User.from_omniauth(auth)

    if user.persisted?
      sign_out_all_scopes
      sign_in_and_redirect user, event: :authentication
    else
      session["devise.google_oauth2_data"] = auth.except("extra")
      redirect_to new_user_registration_url, alert: user.errors.full_messages.join("\n")
    end
  end

  def failure
    redirect_to new_user_session_path, alert: I18n.t("devise.omniauth_callbacks.failure",
      kind: "Google", reason: request.env["omniauth.error.type"].to_s.humanize)
  end

  private

  def auth
    @auth ||= request.env["omniauth.auth"]
  end
end
