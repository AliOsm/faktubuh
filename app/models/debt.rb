class Debt < ApplicationRecord
  belongs_to :debtor, class_name: "User", optional: true
  belongs_to :creditor, class_name: "User", optional: true

  enum :status, { pending: 0, settled: 1 }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, presence: true, length: { is: 3 }

  def debtor_name
    "#{debtor.first_name} #{debtor.last_name}"
  end

  def creditor_name
    "#{creditor.first_name} #{creditor.last_name}"
  end
end
