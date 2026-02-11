module DeviseOverrides
  extend ActiveSupport::Concern

  included do
    def send_devise_notification(notification, *) = devise_mailer.send(notification, self, *).deliver_later
  end
end
