class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  include Pagy::Backend

  around_action :switch_locale

  inertia_share do
    {
      locale: I18n.locale.to_s,
      flash: {
        notice: flash[:notice],
        alert: flash[:alert]
      }
    }
  end

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
    header = request.env["HTTP_ACCEPT_LANGUAGE"]
    return "en" if header.blank?

    # Parse "ar-SA,ar;q=0.9,en;q=0.8" format
    locales = header.split(",").map do |lang|
      parts = lang.strip.split(";")
      locale = parts[0].split("-").first
      quality = parts[1]&.match(/q=([\d.]+)/)&.[](1)&.to_f || 1.0
      { locale: locale, quality: quality }
    end

    sorted = locales.sort_by { |l| -l[:quality] }
    sorted.find { |l| I18n.available_locales.include?(l[:locale].to_sym) }&.dig(:locale) || "en"
  end
end
