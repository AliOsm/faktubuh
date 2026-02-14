class User < ApplicationRecord
  include DeviseOverrides
  include OmniauthConcern

  PERSONAL_ID_CHARS = ("A".."Z").to_a.concat(("2".."9").to_a) - %w[O I L]
  PERSONAL_ID_LENGTH = 6
  PERSONAL_ID_MIN_LENGTH = 3
  PERSONAL_ID_MAX_LENGTH = 12
  PERSONAL_ID_MAX_ATTEMPTS = 10

  # Prevent deletion if user is a lender with debts
  has_many :lent_debts, class_name: "Debt", foreign_key: :lender_id,
           dependent: :restrict_with_error, inverse_of: :lender

  # Prevent deletion if user is a borrower with debts
  has_many :borrowed_debts, class_name: "Debt", foreign_key: :borrower_id,
           dependent: :restrict_with_error, inverse_of: :borrower

  # Prevent deletion if user has submitted payments
  has_many :payments, foreign_key: :submitter_id,
           dependent: :restrict_with_error, inverse_of: :submitter

  # Prevent deletion if user is a witness (keep them in history)
  has_many :witnesses, dependent: :restrict_with_error

  # OK to delete user's own notifications
  has_many :notifications, dependent: :destroy

  # Protect admin attribute from mass assignment
  attr_readonly :admin

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :lockable,
         :omniauthable, omniauth_providers: [ :google_oauth2 ]

  validates :full_name, presence: true
  validates :personal_id, presence: true, uniqueness: true,
                          format: { with: /\A[A-Z0-9]{3,12}\z/ }

  before_validation :normalize_personal_id
  before_validation :generate_personal_id, on: :create, if: -> { personal_id.blank? }

  # Skip confirmation for OAuth users
  def confirmation_required?
    !provider.present?
  end

  protected

  def send_on_create_confirmation_instructions
    confirmation_required? ? super : true
  end

  private

  def normalize_personal_id
    self.personal_id = personal_id.strip.upcase if personal_id.present?
  end

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
