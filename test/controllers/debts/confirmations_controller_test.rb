# frozen_string_literal: true

require "test_helper"

class Debts::ConfirmationsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @lender = users(:one)
    @borrower = users(:two)
    sign_in @lender
  end

  test "non-creator confirms pending debt — becomes active with installments" do
    debt = debts(:pending_mutual_debt)
    assert_equal "pending", debt.status

    # Borrower (non-creator) confirms
    sign_in @borrower
    assert_difference "Notification.count", 1 do
      post debt_confirmation_url(debt)
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
      delete debt_confirmation_url(debt)
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
    post debt_confirmation_url(debt)

    debt.reload
    assert_equal "pending", debt.status
    assert_redirected_to debt_path(debt)
  end

  test "already active debt cannot be confirmed again" do
    debt = debts(:mutual_debt)
    assert_equal "active", debt.status

    sign_in @borrower
    post debt_confirmation_url(debt)

    debt.reload
    assert_equal "active", debt.status
    assert_redirected_to debt_path(debt)
  end
end
