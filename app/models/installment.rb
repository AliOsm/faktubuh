class Installment < ApplicationRecord
  belongs_to :debt
  has_many :payments, dependent: :nullify

  enum :status, {
    upcoming: "upcoming",
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
    overdue: "overdue"
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :due_date, presence: true
end
