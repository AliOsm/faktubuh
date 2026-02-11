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
end
