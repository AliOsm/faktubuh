# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_config default_render: true

  inertia_share do
    {
      locale: I18n.locale.to_s,
      flash: {
        notice: flash[:notice],
        alert: flash[:alert]
      }
    }
  end
end
