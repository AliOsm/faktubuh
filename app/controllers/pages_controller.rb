class PagesController < ApplicationController
  def home
    render inertia: "Pages/Home"
  end
end
