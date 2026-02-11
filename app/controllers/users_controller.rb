# frozen_string_literal: true

class UsersController < InertiaController
  def lookup
    user = User.find_by(personal_id: params[:personal_id]&.upcase&.strip)

    if user
      render json: { id: user.id, full_name: user.full_name }
    else
      head :not_found
    end
  end
end
