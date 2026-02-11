module OmniauthConcern
  extend ActiveSupport::Concern

  class_methods do
    def from_omniauth(auth)
      user = User.find_by(provider: auth.provider, uid: auth.uid)
      return user if user

      user = User.find_by(email: auth.info.email)
      if user
        user.update!(provider: auth.provider, uid: auth.uid)
        return user
      end

      User.create!(
        email: auth.info.email,
        full_name: auth.info.name,
        provider: auth.provider,
        uid: auth.uid,
        password: Devise.friendly_token[0, 20]
      )
    end
  end
end
