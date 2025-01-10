class User < ApplicationRecord
  include DeviseOverrides

  # :registerable, :recoverable, :lockable
  devise :database_authenticatable, :rememberable, :validatable,
         :timeoutable, :trackable, :omniauthable, :confirmable

  validates :first_name, :last_name, presence: true

  def self.from_omniauth(auth)
    user = find_or_create_by_auth(auth)

    user.update(provider: auth.provider, uid: auth.uid) if user.provider.nil?
    user.confirm unless user.confirmed?

    user
  end

  def self.find_or_create_by_auth(auth)
    where(email: auth.info.email).first_or_create do |new_user|
      new_user.assign_attributes({
                                    email: auth.info.email,
                                    password: Devise.friendly_token[0, 20],
                                    first_name: auth.info.first_name || "غير محدد",
                                    last_name: auth.info.last_name || "غير محدد",
                                    provider: auth.provider,
                                    uid: auth.uid
                                  })

      new_user.skip_confirmation!
    end
  end

  private_class_method :find_or_create_by_auth
end
