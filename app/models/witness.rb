class Witness < ApplicationRecord
  belongs_to :debt
  belongs_to :user

  enum :status, {
    invited: "invited",
    confirmed: "confirmed",
    declined: "declined"
  }

  validates :user_id, uniqueness: { scope: :debt_id }
  validate :user_is_not_debt_party

  private

  def user_is_not_debt_party
    return unless debt

    if [debt.lender_id, debt.borrower_id].include?(user_id)
      errors.add(:user_id, "cannot be a party to the debt")
    end
  end
end
