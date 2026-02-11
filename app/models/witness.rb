class Witness < ApplicationRecord
  belongs_to :debt
  belongs_to :user

  enum :status, {
    invited: "invited",
    confirmed: "confirmed",
    declined: "declined"
  }

  validates :user_id, uniqueness: { scope: :debt_id }
end
