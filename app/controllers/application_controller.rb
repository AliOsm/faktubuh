class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  around_action :switch_locale

  private

  def switch_locale(&action)
    locale = extract_locale
    I18n.with_locale(locale, &action)
  end

  def extract_locale
    locale = params[:locale] || cookies[:locale] || extract_locale_from_accept_language_header
    locale.to_s.in?(I18n.available_locales.map(&:to_s)) ? locale : I18n.default_locale
  end

  def extract_locale_from_accept_language_header
    accept_language = request.env["HTTP_ACCEPT_LANGUAGE"]
    return nil unless accept_language

    accept_language.scan(/\A[a-z]{2}/).first
  end
end
