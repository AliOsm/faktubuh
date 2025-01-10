class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    user = User.from_omniauth(auth)

    if user.present?
      sign_out_all_scopes
      flash[:notice] = t("devise.omniauth_callbacks.success", kind: "Google") if is_navigational_format?
      sign_in_and_redirect user, event: :authentication
    else
      redirect_to root_path,
                  alert: t("devise.omniauth_callbacks.failure",
                           kind: "Google",
                           reason: t("devise.omniauth_callbacks.reason", email: auth.info.email))
    end
  end

  private

  def auth
    @auth ||= request.env["omniauth.auth"]
  end
end
