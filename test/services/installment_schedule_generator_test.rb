require "test_helper"

class InstallmentScheduleGeneratorTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
  end

  def create_debt(installment_type:, amount: 1000.00, deadline_months: 6)
    Debt.create!(
      lender: @user,
      counterparty_name: "Test Person",
      mode: "personal",
      creator_role: "lender",
      amount: amount,
      currency: "USD",
      deadline: deadline_months.months.from_now.to_date,
      installment_type: installment_type,
      status: "active"
    )
  end

  # Lump Sum tests

  test "lump_sum creates one installment for full amount at deadline" do
    debt = create_debt(installment_type: "lump_sum")
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 1, installments.size
    assert_equal debt.amount, installments.first.amount
    assert_equal debt.deadline, installments.first.due_date
    assert_equal "upcoming", installments.first.status
  end

  # Monthly tests

  test "monthly creates equal installments from creation to deadline" do
    debt = create_debt(installment_type: "monthly", amount: 600.00, deadline_months: 6)
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 6, installments.size
    installments.each do |inst|
      assert_equal "upcoming", inst.status
    end
  end

  test "monthly with exact division has equal amounts" do
    debt = create_debt(installment_type: "monthly", amount: 600.00, deadline_months: 6)
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 6, installments.size
    installments.each do |inst|
      assert_equal 100.00, inst.amount.to_f
    end
  end

  test "monthly with remainder puts extra in last installment" do
    debt = create_debt(installment_type: "monthly", amount: 100.00, deadline_months: 3)
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 3, installments.size
    assert_equal 33.33, installments[0].amount.to_f
    assert_equal 33.33, installments[1].amount.to_f
    assert_equal 33.34, installments[2].amount.to_f
  end

  test "monthly with deadline 1 month away creates 1 installment" do
    debt = create_debt(installment_type: "monthly", amount: 500.00, deadline_months: 1)
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 1, installments.size
    assert_equal 500.00, installments.first.amount.to_f
    assert_equal debt.deadline, installments.first.due_date
  end

  test "monthly installments have correct due dates" do
    debt = create_debt(installment_type: "monthly", amount: 300.00, deadline_months: 3)
    installments = InstallmentScheduleGenerator.new(debt).generate!

    start_date = debt.created_at.to_date
    assert_equal start_date + 1.month, installments[0].due_date
    assert_equal start_date + 2.months, installments[1].due_date
    assert_equal debt.deadline, installments[2].due_date
  end

  # Bi-weekly tests

  test "bi_weekly creates installments at 2-week intervals" do
    debt = create_debt(installment_type: "bi_weekly", amount: 1000.00, deadline_months: 2)
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert installments.size >= 2
    installments.each do |inst|
      assert_equal "upcoming", inst.status
      assert inst.amount > 0
    end
    assert_equal debt.amount, installments.sum(&:amount).round(2)
  end

  # Quarterly tests

  test "quarterly creates installments at 3-month intervals" do
    debt = create_debt(installment_type: "quarterly", amount: 1200.00, deadline_months: 12)
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 4, installments.size
    installments.each do |inst|
      assert_equal 300.00, inst.amount.to_f
    end
    assert_equal debt.amount, installments.sum(&:amount).round(2)
  end

  # Yearly tests

  test "yearly creates installments at 12-month intervals" do
    debt = create_debt(installment_type: "yearly", amount: 2400.00)
    # Default 6 months away — less than 12 months, so only 1 installment at deadline
    debt_long = Debt.create!(
      lender: @user,
      counterparty_name: "Test Person",
      mode: "personal",
      creator_role: "lender",
      amount: 2400.00,
      currency: "USD",
      deadline: 24.months.from_now.to_date,
      installment_type: "yearly",
      status: "active"
    )
    installments = InstallmentScheduleGenerator.new(debt_long).generate!

    assert_equal 2, installments.size
    assert_equal 1200.00, installments[0].amount.to_f
    assert_equal 1200.00, installments[1].amount.to_f
    assert_equal debt_long.deadline, installments.last.due_date
  end

  # Custom split tests

  test "custom_split creates no installments" do
    debt = create_debt(installment_type: "custom_split")
    installments = InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 0, installments.size
  end

  # All installments are persisted

  test "installments are persisted to database" do
    debt = create_debt(installment_type: "monthly", amount: 300.00, deadline_months: 3)
    InstallmentScheduleGenerator.new(debt).generate!

    assert_equal 3, debt.installments.count
  end

  # Total amounts match

  test "total of all installments equals debt amount for all periodic types" do
    %w[monthly bi_weekly quarterly].each do |type|
      debt = create_debt(installment_type: type, amount: 1000.00, deadline_months: 6)
      installments = InstallmentScheduleGenerator.new(debt).generate!
      total = installments.sum(&:amount).round(2)
      assert_equal debt.amount.to_f, total.to_f, "Total mismatch for #{type}: expected #{debt.amount}, got #{total}"
    end
  end
end
