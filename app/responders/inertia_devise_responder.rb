# frozen_string_literal: true

class InertiaDeviseResponder < Devise::Controllers::Responder
  def to_html = has_errors? ? redirect_with_failure : super

  private

  def redirect_with_failure
    case [ controller.controller_path, controller.action_name ]
    when [ "users/registrations", "create" ], [ "users/registrations", "update" ],
      [ "users/passwords", "create" ], [ "users/passwords", "update" ],
      [ "users/confirmations", "create" ], [ "users/unlocks", "create" ]
      redirect_with_errors
    when [ "users/confirmations", "show" ], [ "users/unlocks", "show" ]
      redirect_with_alert
    else
      super
    end
  end

  def redirect_with_errors
    controller.redirect_to controller.send(:after_failure_path_for, resource),
                           inertia: controller.send(:inertia_errors, resource)
  end

  def redirect_with_alert
    controller.redirect_to controller.send(:after_failure_path_for, resource),
                           alert: I18n.t(controller.send(:invalid_token_message_key))
  end
end
