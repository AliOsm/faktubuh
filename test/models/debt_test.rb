require "test_helper"

class DebtTest < ActiveSupport::TestCase
  # === Associations ===

  test "belongs to lender" do
    debt = debts(:mutual_debt)
    assert_equal users(:one), debt.lender
  end

  test "belongs to borrower" do
    debt = debts(:mutual_debt)
    assert_equal users(:two), debt.borrower
  end

  test "borrower is optional" do
    debt = debts(:personal_debt)
    assert_nil debt.borrower
  end

  test "has many installments" do
    debt = debts(:mutual_debt)
    assert_respond_to debt, :installments
  end

  test "has many payments" do
    debt = debts(:mutual_debt)
    assert_respond_to debt, :payments
  end

  test "has many witnesses" do
    debt = debts(:mutual_debt)
    assert_respond_to debt, :witnesses
  end

  # === Validations ===

  test "valid mutual debt" do
    debt = Debt.new(
      lender: users(:one),
      borrower: users(:two),
      mode: :mutual,
      creator_role: :lender,
      amount: 500,
      currency: "USD",
      deadline: 30.days.from_now.to_date,
      installment_type: :lump_sum
    )
    assert debt.valid?
  end

  test "valid personal debt" do
    debt = Debt.new(
      lender: users(:one),
      counterparty_name: "Ahmed",
      mode: :personal,
      creator_role: :lender,
      amount: 500,
      currency: "SAR",
      deadline: 30.days.from_now.to_date,
      installment_type: :monthly
    )
    assert debt.valid?
  end

  test "amount must be positive" do
    debt = Debt.new(
      lender: users(:one),
      borrower: users(:two),
      mode: :mutual,
      creator_role: :lender,
      amount: 0,
      currency: "USD",
      deadline: 30.days.from_now.to_date,
      installment_type: :lump_sum
    )
    assert_not debt.valid?
    assert_includes debt.errors[:amount], "must be greater than 0"
  end

  test "negative amount is invalid" do
    debt = Debt.new(
      lender: users(:one),
      borrower: users(:two),
      mode: :mutual,
      creator_role: :lender,
      amount: -100,
      currency: "USD",
      deadline: 30.days.from_now.to_date,
      installment_type: :lump_sum
    )
    assert_not debt.valid?
    assert_includes debt.errors[:amount], "must be greater than 0"
  end

  test "currency is required" do
    debt = Debt.new(
      lender: users(:one),
      borrower: users(:two),
      mode: :mutual,
      creator_role: :lender,
      amount: 500,
      currency: "",
      deadline: 30.days.from_now.to_date,
      installment_type: :lump_sum
    )
    assert_not debt.valid?
    assert_includes debt.errors[:currency], "can't be blank"
  end

  test "deadline is required" do
    debt = Debt.new(
      lender: users(:one),
      borrower: users(:two),
      mode: :mutual,
      creator_role: :lender,
      amount: 500,
      currency: "USD",
      deadline: nil,
      installment_type: :lump_sum
    )
    assert_not debt.valid?
    assert_includes debt.errors[:deadline], "can't be blank"
  end

  # === Mode-specific validations ===

  test "mutual mode requires borrower_id" do
    debt = Debt.new(
      lender: users(:one),
      borrower: nil,
      mode: :mutual,
      creator_role: :lender,
      amount: 500,
      currency: "USD",
      deadline: 30.days.from_now.to_date,
      installment_type: :lump_sum
    )
    assert_not debt.valid?
    assert_includes debt.errors[:borrower_id], "must be present for mutual debts"
  end

  test "personal mode requires counterparty_name" do
    debt = Debt.new(
      lender: users(:one),
      counterparty_name: nil,
      mode: :personal,
      creator_role: :lender,
      amount: 500,
      currency: "SAR",
      deadline: 30.days.from_now.to_date,
      installment_type: :monthly
    )
    assert_not debt.valid?
    assert_includes debt.errors[:counterparty_name], "must be present for personal debts"
  end

  test "personal mode does not require borrower_id" do
    debt = Debt.new(
      lender: users(:one),
      counterparty_name: "Ahmed",
      mode: :personal,
      creator_role: :lender,
      amount: 500,
      currency: "SAR",
      deadline: 30.days.from_now.to_date,
      installment_type: :monthly
    )
    assert debt.valid?
    assert_nil debt.borrower_id
  end

  test "mutual mode does not require counterparty_name" do
    debt = Debt.new(
      lender: users(:one),
      borrower: users(:two),
      mode: :mutual,
      creator_role: :lender,
      amount: 500,
      currency: "USD",
      deadline: 30.days.from_now.to_date,
      installment_type: :lump_sum
    )
    assert debt.valid?
    assert_nil debt.counterparty_name
  end

  # === Enums ===

  test "mode enum values" do
    assert_equal({ "mutual" => "mutual", "personal" => "personal" }, Debt.modes)
  end

  test "creator_role enum values" do
    assert_equal({ "lender" => "lender", "borrower" => "borrower" }, Debt.creator_roles)
  end

  test "installment_type enum values" do
    expected = {
      "lump_sum" => "lump_sum",
      "monthly" => "monthly",
      "bi_weekly" => "bi_weekly",
      "quarterly" => "quarterly",
      "yearly" => "yearly",
      "custom_split" => "custom_split"
    }
    assert_equal expected, Debt.installment_types
  end

  test "status enum values" do
    expected = {
      "pending" => "pending",
      "active" => "active",
      "settled" => "settled",
      "rejected" => "rejected"
    }
    assert_equal expected, Debt.statuses
  end

  test "default status is pending" do
    debt = Debt.new
    assert_equal "pending", debt.status
  end

  # === Enum query methods ===

  test "status query methods work" do
    debt = debts(:mutual_debt)
    assert debt.active?
    assert_not debt.pending?
    assert_not debt.settled?
    assert_not debt.rejected?
  end

  test "mode query methods work" do
    mutual = debts(:mutual_debt)
    personal = debts(:personal_debt)
    assert mutual.mutual?
    assert_not mutual.personal?
    assert personal.personal?
    assert_not personal.mutual?
  end
end
