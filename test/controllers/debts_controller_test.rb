# frozen_string_literal: true

require "test_helper"

class DebtsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @lender = users(:one)
    @borrower = users(:two)
    sign_in @lender
  end

  test "create mutual debt as lender — debt pending, other party notified" do
    assert_difference [ "Debt.count", "Notification.count" ], 1 do
      post debts_url, params: {
        debt: {
          creator_role: "lender",
          mode: "mutual",
          amount: 500.00,
          currency: "USD",
          deadline: 30.days.from_now.to_date.to_s,
          description: "Loan for car repair",
          installment_type: "lump_sum",
          counterparty_personal_id: @borrower.personal_id
        }
      }
    end

    debt = Debt.last
    assert_redirected_to debt_path(debt)
    assert_equal "pending", debt.status
    assert_equal "mutual", debt.mode
    assert_equal "lender", debt.creator_role
    assert_equal @lender.id, debt.lender_id
    assert_equal @borrower.id, debt.borrower_id
    assert_equal 500.00, debt.amount.to_f
    assert_equal "USD", debt.currency
    assert_equal "lump_sum", debt.installment_type
    assert_equal "Loan for car repair", debt.description

    # No installments generated for pending mutual debt
    assert_equal 0, debt.installments.count

    # Notification sent to borrower
    notification = Notification.last
    assert_equal @borrower.id, notification.user_id
    assert_equal "debt_created", notification.notification_type
    assert_equal debt.id, notification.debt_id
  end

  test "create personal debt — debt active, installments generated" do
    assert_difference "Debt.count", 1 do
      assert_no_difference "Notification.count" do
        post debts_url, params: {
          debt: {
            creator_role: "lender",
            mode: "personal",
            amount: 1200.00,
            currency: "SAR",
            deadline: 90.days.from_now.to_date.to_s,
            description: "Personal loan to Ahmed",
            installment_type: "monthly",
            counterparty_name: "Ahmed Hassan"
          }
        }
      end
    end

    debt = Debt.last
    assert_redirected_to debt_path(debt)
    assert_equal "active", debt.status
    assert_equal "personal", debt.mode
    assert_equal "lender", debt.creator_role
    assert_equal @lender.id, debt.lender_id
    assert_nil debt.borrower_id
    assert_equal "Ahmed Hassan", debt.counterparty_name

    # Installments generated for personal debt
    assert debt.installments.count > 0
    assert_equal 1200.00, debt.installments.sum(:amount).to_f
  end

  test "create debt with invalid params returns errors" do
    assert_no_difference "Debt.count" do
      post debts_url, params: {
        debt: {
          creator_role: "lender",
          mode: "personal",
          amount: -10,
          currency: "",
          deadline: "",
          installment_type: "lump_sum",
          counterparty_name: ""
        }
      }
    end

    assert_redirected_to new_debt_path
  end

  test "mutual debt with invalid Personal ID returns error" do
    assert_no_difference "Debt.count" do
      post debts_url, params: {
        debt: {
          creator_role: "lender",
          mode: "mutual",
          amount: 500.00,
          currency: "USD",
          deadline: 30.days.from_now.to_date.to_s,
          installment_type: "lump_sum",
          counterparty_personal_id: "ZZZZZ9"
        }
      }
    end

    assert_redirected_to new_debt_path
  end

  test "requires authentication" do
    sign_out @lender
    post debts_url, params: { debt: { mode: "personal" } }
    assert_response :redirect
  end

  # --- show action tests ---

  test "lender can view debt detail" do
    debt = debts(:mutual_debt)
    get debt_url(debt)
    assert_response :success
  end

  test "borrower can view debt detail" do
    debt = debts(:mutual_debt)
    sign_in @borrower
    get debt_url(debt)
    assert_response :success
  end

  test "unauthorized user gets redirected from debt detail" do
    debt = debts(:mutual_debt)
    unauthorized_user = users(:three)
    sign_in unauthorized_user
    get debt_url(debt)
    assert_redirected_to debts_path
  end

  test "confirmed witness can view debt detail" do
    debt = debts(:personal_debt)
    witness_user = users(:three)
    sign_in witness_user
    get debt_url(debt)
    assert_response :success
  end

  # --- confirm action tests ---

  test "non-creator confirms pending debt — becomes active with installments" do
    debt = debts(:pending_mutual_debt)
    assert_equal "pending", debt.status

    # Borrower (non-creator) confirms
    sign_in @borrower
    assert_difference "Notification.count", 1 do
      post confirm_debt_url(debt)
    end

    debt.reload
    assert_equal "active", debt.status
    assert debt.installments.count > 0
    assert_redirected_to debt_path(debt)

    # Notification sent to creator (lender)
    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "debt_confirmed", notification.notification_type
    assert_equal debt.id, notification.debt_id
  end

  test "non-creator rejects pending debt — becomes rejected" do
    debt = debts(:pending_mutual_debt)
    assert_equal "pending", debt.status

    sign_in @borrower
    assert_difference "Notification.count", 1 do
      post reject_debt_url(debt)
    end

    debt.reload
    assert_equal "rejected", debt.status
    assert_redirected_to debt_path(debt)

    # Notification sent to creator (lender)
    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "debt_rejected", notification.notification_type
  end

  test "creator cannot confirm own debt" do
    debt = debts(:pending_mutual_debt)

    # Lender is the creator — should not be allowed to confirm
    sign_in @lender
    post confirm_debt_url(debt)

    debt.reload
    assert_equal "pending", debt.status
    assert_redirected_to debt_path(debt)
  end

  test "already active debt cannot be confirmed again" do
    debt = debts(:mutual_debt)
    assert_equal "active", debt.status

    sign_in @borrower
    post confirm_debt_url(debt)

    debt.reload
    assert_equal "active", debt.status
    assert_redirected_to debt_path(debt)
  end
end
