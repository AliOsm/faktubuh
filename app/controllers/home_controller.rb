# frozen_string_literal: true

class HomeController < ApplicationController
  def index
    render inertia: "home/index", props: { locale: I18n.locale.to_s }
  end
end
