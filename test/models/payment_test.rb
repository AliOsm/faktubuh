require "test_helper"

class PaymentTest < ActiveSupport::TestCase
  # === Associations ===

  test "belongs to debt" do
    payment = payments(:pending_payment)
    assert_equal debts(:mutual_debt), payment.debt
  end

  test "belongs to submitter" do
    payment = payments(:pending_payment)
    assert_equal users(:two), payment.submitter
  end

  test "belongs to installment optionally" do
    payment = payments(:pending_payment)
    assert_nil payment.installment
  end

  test "can belong to installment" do
    payment = Payment.new(
      debt: debts(:mutual_debt),
      installment: installments(:lump_sum_installment),
      submitter: users(:two),
      amount: 200,
      submitted_at: Time.current
    )
    assert payment.valid?
    assert_equal installments(:lump_sum_installment), payment.installment
  end

  test "installment must belong to the same debt" do
    payment = Payment.new(
      debt: debts(:mutual_debt),
      installment: installments(:monthly_installment_one), # belongs to personal_debt
      submitter: users(:two),
      amount: 200,
      submitted_at: Time.current
    )
    assert_not payment.valid?
    assert_includes payment.errors[:installment_id], "must belong to the same debt"
  end

  test "invalid installment_id is rejected before hitting the database" do
    payment = Payment.new(
      debt: debts(:mutual_debt),
      installment_id: 999_999_999,
      submitter: users(:two),
      amount: 200,
      submitted_at: Time.current
    )
    assert_not payment.valid?
    assert_includes payment.errors[:installment_id], "is invalid"
  end

  # === Validations ===

  test "valid payment" do
    payment = Payment.new(
      debt: debts(:mutual_debt),
      submitter: users(:two),
      amount: 200,
      submitted_at: Time.current
    )
    assert payment.valid?
  end

  test "amount must be positive" do
    payment = Payment.new(
      debt: debts(:mutual_debt),
      submitter: users(:two),
      amount: 0,
      submitted_at: Time.current
    )
    assert_not payment.valid?
    assert_includes payment.errors[:amount], "must be greater than 0"
  end

  test "negative amount is invalid" do
    payment = Payment.new(
      debt: debts(:mutual_debt),
      submitter: users(:two),
      amount: -50,
      submitted_at: Time.current
    )
    assert_not payment.valid?
    assert_includes payment.errors[:amount], "must be greater than 0"
  end

  test "submitted_at is required" do
    payment = Payment.new(
      debt: debts(:mutual_debt),
      submitter: users(:two),
      amount: 200,
      submitted_at: nil
    )
    assert_not payment.valid?
    assert_includes payment.errors[:submitted_at], "can't be blank"
  end

  # === Enums ===

  test "status enum values" do
    expected = {
      "pending" => "pending",
      "approved" => "approved",
      "rejected" => "rejected"
    }
    assert_equal expected, Payment.statuses
  end

  test "default status is pending" do
    payment = Payment.new
    assert_equal "pending", payment.status
  end

  test "status query methods work" do
    payment = payments(:pending_payment)
    assert payment.pending?
    assert_not payment.approved?
    assert_not payment.rejected?
  end

  test "approved payment status" do
    payment = payments(:approved_payment)
    assert payment.approved?
    assert_not payment.pending?
  end
end
