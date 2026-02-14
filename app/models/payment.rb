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
  validate :installment_must_exist_and_belong_to_debt
  validate :amount_within_remaining_balance, on: :create, unless: :skip_balance_validation

  attr_accessor :skip_balance_validation

  def submitter_name = submitter.full_name

  def self_reported
    debt.personal? && submitter_id == debt.lender_id && approved?
  end

  def as_json(options = {})
    super.tap { it["amount"] = it["amount"].to_f if it.key?("amount") }
  end

  private

  def installment_must_exist_and_belong_to_debt
    return if installment_id.blank?

    if installment.nil?
      errors.add(:installment_id, "is invalid")
      return
    end

    return if installment.debt_id == debt_id

    errors.add(:installment_id, "must belong to the same debt")
  end

  def amount_within_remaining_balance
    return unless debt && amount.present? && amount.positive?

    remaining = debt.amount - debt.payments.approved.sum(:amount)
    errors.add(:amount, "exceeds remaining balance of #{remaining}") if amount > remaining
  end
end
