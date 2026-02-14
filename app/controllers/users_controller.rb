# frozen_string_literal: true

class UsersController < InertiaController
  rate_limit to: 100, within: 1.hour, only: :lookup,
    by: -> { current_user.id },
    with: -> {
      render json: { error: "Too many requests" }, status: :too_many_requests
    }

  def lookup
    user = User.find_by(personal_id: params[:personal_id]&.upcase&.strip)

    if user
      render json: { id: user.id, full_name: user.full_name }
    else
      head :not_found
    end
  end
end
