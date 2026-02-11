# frozen_string_literal: true

require "test_helper"

class PaymentsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @lender = users(:one)
    @borrower = users(:two)
    @mutual_debt = debts(:mutual_debt)
    @personal_debt = debts(:personal_debt)
  end

  test "borrower submits valid payment — status pending, lender notified" do
    sign_in @borrower

    assert_difference [ "Payment.count", "Notification.count" ], 1 do
      post debt_payments_url(@mutual_debt), params: {
        payment: {
          amount: 300.00,
          description: "First payment"
        }
      }
    end

    payment = Payment.last
    assert_redirected_to debt_path(@mutual_debt)
    assert_equal "pending", payment.status
    assert_equal 300.00, payment.amount.to_f
    assert_equal "First payment", payment.description
    assert_equal @borrower.id, payment.submitter_id
    assert_not_nil payment.submitted_at

    # Notification sent to lender
    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "payment_submitted", notification.notification_type
    assert_equal @mutual_debt.id, notification.debt_id
  end

  test "personal mode payment auto-approved" do
    sign_in @lender

    assert_difference "Payment.count", 1 do
      assert_no_difference "Notification.count" do
        post debt_payments_url(@personal_debt), params: {
          payment: {
            amount: 100.00,
            description: "Self-recorded payment"
          }
        }
      end
    end

    payment = Payment.last
    assert_redirected_to debt_path(@personal_debt)
    assert_equal "approved", payment.status
    assert_equal 100.00, payment.amount.to_f
    assert_equal @lender.id, payment.submitter_id
  end

  test "payment exceeding remaining balance rejected" do
    sign_in @borrower

    assert_no_difference "Payment.count" do
      post debt_payments_url(@mutual_debt), params: {
        payment: {
          amount: 1500.00
        }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end

  test "payment on non-active debt rejected" do
    sign_in @borrower
    pending_debt = debts(:pending_mutual_debt)

    assert_no_difference "Payment.count" do
      post debt_payments_url(pending_debt), params: {
        payment: {
          amount: 100.00
        }
      }
    end

    assert_redirected_to debt_path(pending_debt)
  end

  test "lender cannot submit payment on mutual debt" do
    sign_in @lender

    assert_no_difference "Payment.count" do
      post debt_payments_url(@mutual_debt), params: {
        payment: {
          amount: 100.00
        }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end

  test "requires authentication" do
    post debt_payments_url(@mutual_debt), params: {
      payment: { amount: 100.00 }
    }
    assert_response :redirect
  end

  # --- US-024: Payment approval and auto-settlement ---

  test "lender approves payment — status approved, borrower notified" do
    sign_in @lender
    pending_payment = payments(:pending_payment)

    assert_difference "Notification.count", 1 do
      post approve_debt_payment_url(@mutual_debt, pending_payment)
    end

    assert_redirected_to debt_path(@mutual_debt)
    pending_payment.reload
    assert_equal "approved", pending_payment.status

    # Notification sent to borrower (submitter)
    notification = Notification.last
    assert_equal @borrower.id, notification.user_id
    assert_equal "payment_approved", notification.notification_type
    assert_equal @mutual_debt.id, notification.debt_id
  end

  test "lender rejects payment with reason — status rejected, borrower notified" do
    sign_in @lender
    pending_payment = payments(:pending_payment)

    assert_difference "Notification.count", 1 do
      post reject_debt_payment_url(@mutual_debt, pending_payment), params: {
        rejection_reason: "Incorrect amount"
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
    pending_payment.reload
    assert_equal "rejected", pending_payment.status
    assert_equal "Incorrect amount", pending_payment.rejection_reason

    notification = Notification.last
    assert_equal @borrower.id, notification.user_id
    assert_equal "payment_rejected", notification.notification_type
  end

  test "approval triggers auto-settlement when fully paid" do
    sign_in @lender

    # Create a payment for the full remaining amount (1000 - 200 existing pending = need 1000 since pending doesn't count)
    # The mutual_debt is 1000 USD. pending_payment is 200 but pending (not approved).
    # Create an approved payment covering most of the debt, then approve the pending one.
    # First, let's create a large approved payment so that approving the pending_payment settles it.
    Payment.create!(
      debt: @mutual_debt,
      submitter: @borrower,
      amount: 800.00,
      submitted_at: 1.day.ago,
      status: "approved"
    )

    pending_payment = payments(:pending_payment)
    # Now total approved = 800. Pending payment is 200. After approval, total = 1000 = debt amount.

    post approve_debt_payment_url(@mutual_debt, pending_payment)

    assert_redirected_to debt_path(@mutual_debt)
    pending_payment.reload
    assert_equal "approved", pending_payment.status

    @mutual_debt.reload
    assert_equal "settled", @mutual_debt.status

    # Settlement notifications for both parties
    settlement_notifications = Notification.where(notification_type: "debt_settled", debt_id: @mutual_debt.id)
    assert_equal 2, settlement_notifications.count
  end

  test "borrower cannot approve payments" do
    sign_in @borrower
    pending_payment = payments(:pending_payment)

    assert_no_difference "Notification.count" do
      post approve_debt_payment_url(@mutual_debt, pending_payment)
    end

    assert_redirected_to debt_path(@mutual_debt)
    pending_payment.reload
    assert_equal "pending", pending_payment.status
  end
end
