# frozen_string_literal: true

class PagesController < ApplicationController
  def privacy
    render inertia: "pages/Privacy"
  end
end
