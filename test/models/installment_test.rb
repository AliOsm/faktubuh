require "test_helper"

class InstallmentTest < ActiveSupport::TestCase
  # === Associations ===

  test "belongs to debt" do
    installment = installments(:lump_sum_installment)
    assert_equal debts(:mutual_debt), installment.debt
  end

  test "has many payments" do
    installment = installments(:lump_sum_installment)
    assert_respond_to installment, :payments
  end

  # === Validations ===

  test "valid installment" do
    installment = Installment.new(
      debt: debts(:mutual_debt),
      amount: 500,
      due_date: 30.days.from_now.to_date
    )
    assert installment.valid?
  end

  test "amount must be positive" do
    installment = Installment.new(
      debt: debts(:mutual_debt),
      amount: 0,
      due_date: 30.days.from_now.to_date
    )
    assert_not installment.valid?
    assert_includes installment.errors[:amount], "must be greater than 0"
  end

  test "negative amount is invalid" do
    installment = Installment.new(
      debt: debts(:mutual_debt),
      amount: -100,
      due_date: 30.days.from_now.to_date
    )
    assert_not installment.valid?
    assert_includes installment.errors[:amount], "must be greater than 0"
  end

  test "due_date is required" do
    installment = Installment.new(
      debt: debts(:mutual_debt),
      amount: 500,
      due_date: nil
    )
    assert_not installment.valid?
    assert_includes installment.errors[:due_date], "can't be blank"
  end

  # === Enums ===

  test "status enum values" do
    expected = {
      "upcoming" => "upcoming",
      "submitted" => "submitted",
      "approved" => "approved",
      "rejected" => "rejected",
      "overdue" => "overdue"
    }
    assert_equal expected, Installment.statuses
  end

  test "default status is upcoming" do
    installment = Installment.new
    assert_equal "upcoming", installment.status
  end

  test "status query methods work" do
    installment = installments(:lump_sum_installment)
    assert installment.upcoming?
    assert_not installment.overdue?
    assert_not installment.approved?
  end
end
