# frozen_string_literal: true

class InertiaController < ApplicationController
  before_action :authenticate_user!

  inertia_config default_render: true

  inertia_share do
    {
      auth: if current_user
              { user: current_user.as_json(only: %i[id full_name email personal_id]) }
            end,
      locale: I18n.locale.to_s,
      flash: {
        notice: flash[:notice],
        alert: flash[:alert]
      }
    }
  end
end
