class Debt < ApplicationRecord
  belongs_to :lender, class_name: "User"
  belongs_to :borrower, class_name: "User", optional: true
  belongs_to :upgrade_recipient, class_name: "User", optional: true
  has_many :installments, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :witnesses, dependent: :destroy
  has_many :notifications, dependent: :nullify

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
  validate :deadline_must_be_future, on: :create
  validate :mutual_requires_borrower
  validate :personal_requires_counterparty_name

  scope :for_user, ->(user) {
    where(lender_id: user.id)
      .or(where(borrower_id: user.id))
      .or(where(upgrade_recipient_id: user.id))
  }

  scope :as_lender_for, ->(user) {
    t = arel_table
    mutual_as_lender = t[:mode].eq("mutual").and(t[:lender_id].eq(user.id))
    personal_as_lender = t[:mode].eq("personal")
                                 .and(t[:lender_id].eq(user.id))
                                 .and(t[:creator_role].eq("lender"))
    where(mutual_as_lender.or(personal_as_lender))
  }

  scope :as_borrower_for, ->(user) {
    t = arel_table
    mutual_as_borrower = t[:mode].eq("mutual").and(t[:borrower_id].eq(user.id))
    personal_as_borrower = t[:mode].eq("personal")
                                   .and(t[:lender_id].eq(user.id))
                                   .and(t[:creator_role].eq("borrower"))
    where(mutual_as_borrower.or(personal_as_borrower))
  }

  def self.sorted_by(param)
    case param
    when "deadline_asc"  then order(deadline: :asc)
    when "amount_desc"   then order(amount: :desc)
    else                      order(created_at: :desc)
    end
  end

  def creator
    if personal?
      lender
    else
      creator_role_lender? ? lender : borrower
    end
  end

  def confirming_party?(user)
    if creator_role_lender?
      borrower_id == user.id
    else
      lender_id == user.id
    end
  end

  def borrower_for?(user)
    if mutual?
      borrower_id == user.id
    else
      lender_id == user.id
    end
  end

  def remaining_balance = amount - payments.approved.sum(:amount)

  def can_manage_witnesses?(user)
    return false if settled? || rejected?

    creator&.id == user.id
  end

  def can_upgrade?(user)
    personal? && active? && upgrade_recipient_id.nil? && creator&.id == user.id
  end

  def counterparty_name_for(user)
    if personal?
      counterparty_name
    elsif lender_id == user.id
      borrower&.full_name || "Unknown"
    else
      lender.full_name
    end
  end

  def payment_progress
    approved_total = payments.select(&:approved?).sum(&:amount).to_f
    amount.to_f > 0 ? ((approved_total / amount.to_f) * 100).round(1) : 0
  end

  def as_json(options = {})
    super.tap { it["amount"] = it["amount"].to_f if it.key?("amount") }
  end

  private

  def mutual_requires_borrower
    return unless mutual?

    errors.add(:borrower_id, "must be present for mutual debts") if borrower_id.blank?
  end

  def personal_requires_counterparty_name
    return unless personal?

    errors.add(:counterparty_name, "must be present for personal debts") if counterparty_name.blank?
  end

  def deadline_must_be_future
    return unless deadline.present?

    if deadline <= Date.current
      errors.add(:deadline, :must_be_future)
    end
  end
end
