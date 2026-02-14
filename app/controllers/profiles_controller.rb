# frozen_string_literal: true

class ProfilesController < InertiaController
  def show
    render inertia: "profile/Show", props: {
      user: current_user.as_json(only: %i[id full_name email personal_id locale created_at])
    }
  end

  def update
    if current_user.update(profile_params)
      redirect_to profile_path, notice: I18n.t("profile.update_success")
    else
      redirect_to profile_path, inertia: { errors: current_user.errors.to_hash(true) }
    end
  rescue ActiveRecord::RecordNotUnique => e
    if e.message.include?("personal_id")
      current_user.errors.add(:personal_id, "is already taken")
      redirect_to profile_path, inertia: { errors: current_user.errors.to_hash(true) }
    else
      raise
    end
  end

  private

  def profile_params
    params.require(:user).permit(:full_name, :personal_id)
  end
end
