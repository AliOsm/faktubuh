class User < ApplicationRecord
  include DeviseOverrides
  include OmniauthConcern

  PERSONAL_ID_CHARS = ("A".."Z").to_a.concat(("2".."9").to_a) - %w[O I L]
  PERSONAL_ID_LENGTH = 6
  PERSONAL_ID_MAX_ATTEMPTS = 10

  has_many :lent_debts, class_name: "Debt", foreign_key: :lender_id, dependent: :destroy, inverse_of: :lender
  has_many :borrowed_debts, class_name: "Debt", foreign_key: :borrower_id, dependent: :nullify, inverse_of: :borrower
  has_many :payments, foreign_key: :submitter_id, dependent: :destroy, inverse_of: :submitter
  has_many :witnesses, dependent: :destroy
  has_many :notifications, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [ :google_oauth2 ]

  validates :full_name, presence: true
  validates :personal_id, presence: true, uniqueness: true,
                          format: { with: /\A[A-HJ-KM-NP-Z2-9]{6}\z/ }

  before_validation :generate_personal_id, on: :create, if: -> { personal_id.blank? }

  private

  def generate_personal_id
    PERSONAL_ID_MAX_ATTEMPTS.times do
      candidate = Array.new(PERSONAL_ID_LENGTH) { PERSONAL_ID_CHARS.sample }.join
      unless User.exists?(personal_id: candidate)
        self.personal_id = candidate
        return
      end
    end

    # Final attempt — let the unique constraint guard against collision
    self.personal_id = Array.new(PERSONAL_ID_LENGTH) { PERSONAL_ID_CHARS.sample }.join
  end
end
