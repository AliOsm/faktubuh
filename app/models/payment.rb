class Payment < ApplicationRecord
  belongs_to :debt
  belongs_to :installment, optional: true
  belongs_to :submitter, class_name: "User", inverse_of: :payments

  enum :status, {
    pending: "pending",
    approved: "approved",
    rejected: "rejected"
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :submitted_at, presence: true
  validates :rejection_reason, length: { maximum: 500 }, allow_nil: true
  validate :amount_within_remaining_balance, on: :create, unless: :skip_balance_validation

  attr_accessor :skip_balance_validation

  private

  def amount_within_remaining_balance
    return unless debt && amount.present? && amount.positive?

    remaining = debt.amount - debt.payments.approved.sum(:amount)
    errors.add(:amount, "exceeds remaining balance of #{remaining}") if amount > remaining
  end
end
