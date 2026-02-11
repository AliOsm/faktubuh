class Debt < ApplicationRecord
  belongs_to :lender, class_name: "User"
  belongs_to :borrower, class_name: "User", optional: true
  belongs_to :upgrade_recipient, class_name: "User", optional: true
  has_many :installments, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :witnesses, dependent: :destroy

  enum :mode, { mutual: "mutual", personal: "personal" }
  enum :creator_role, { lender: "lender", borrower: "borrower" }, prefix: true
  enum :installment_type, {
    lump_sum: "lump_sum",
    monthly: "monthly",
    bi_weekly: "bi_weekly",
    quarterly: "quarterly",
    yearly: "yearly",
    custom_split: "custom_split"
  }
  enum :status, {
    pending: "pending",
    active: "active",
    settled: "settled",
    rejected: "rejected"
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, presence: true
  validates :deadline, presence: true
  validate :mutual_requires_borrower
  validate :personal_requires_counterparty_name

  private

  def mutual_requires_borrower
    return unless mutual?

    errors.add(:borrower_id, "must be present for mutual debts") if borrower_id.blank?
  end

  def personal_requires_counterparty_name
    return unless personal?

    errors.add(:counterparty_name, "must be present for personal debts") if counterparty_name.blank?
  end
end
