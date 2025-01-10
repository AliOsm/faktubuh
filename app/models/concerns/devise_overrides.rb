module DeviseOverrides
  extend ActiveSupport::Concern

  included do
    def send_devise_notification(notification, *)
      devise_mailer.send(notification, self, *).deliver_later
    end

    def active_for_authentication?
      super && !access_suspended?
    end

    def access_suspended?
      !!suspended_at
    end
  end
end
