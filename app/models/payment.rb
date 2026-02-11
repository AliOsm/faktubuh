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
end
