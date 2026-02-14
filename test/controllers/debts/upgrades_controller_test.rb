# frozen_string_literal: true

require "test_helper"

class Debts::UpgradesControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @lender = users(:one)
    @borrower = users(:two)
    sign_in @lender
  end

  test "upgrade request sent successfully" do
    debt = debts(:personal_debt)
    recipient = users(:two)

    assert_difference "Notification.count", 1 do
      post debt_upgrade_url(debt), params: { personal_id: recipient.personal_id }
    end

    debt.reload
    assert_equal recipient.id, debt.upgrade_recipient_id
    assert_redirected_to debt_path(debt)

    notification = Notification.last
    assert_equal recipient.id, notification.user_id
    assert_equal "upgrade_requested", notification.notification_type
    assert_equal debt.id, notification.debt_id
  end

  test "accept upgrade changes mode to mutual" do
    debt = debts(:personal_debt)
    recipient = users(:two)
    debt.update!(upgrade_recipient_id: recipient.id)

    sign_in recipient
    assert_difference "Notification.count", 1 do
      patch debt_upgrade_url(debt)
    end

    debt.reload
    assert_equal "mutual", debt.mode
    assert_equal recipient.id, debt.borrower_id
    assert_nil debt.upgrade_recipient_id
    assert_redirected_to debt_path(debt)

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "upgrade_accepted", notification.notification_type
  end

  test "accept upgrade sets lender/borrower correctly when creator_role is borrower" do
    debt = Debt.create!(
      lender: @lender, # Personal-mode invariant: creator is stored as lender
      mode: "personal",
      creator_role: "borrower",
      amount: 123.45,
      currency: "USD",
      deadline: 30.days.from_now.to_date,
      installment_type: "lump_sum",
      status: "active",
      counterparty_name: "Someone"
    )
    recipient = users(:two)
    debt.update!(upgrade_recipient_id: recipient.id)

    sign_in recipient
    assert_difference "Notification.count", 1 do
      patch debt_upgrade_url(debt)
    end

    debt.reload
    assert_equal "mutual", debt.mode
    assert_equal recipient.id, debt.lender_id
    assert_equal @lender.id, debt.borrower_id
    assert_nil debt.upgrade_recipient_id
    assert_redirected_to debt_path(debt)

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "upgrade_accepted", notification.notification_type
  end

  test "decline upgrade keeps personal mode" do
    debt = debts(:personal_debt)
    recipient = users(:two)
    debt.update!(upgrade_recipient_id: recipient.id)

    sign_in recipient
    assert_difference "Notification.count", 1 do
      delete debt_upgrade_url(debt)
    end

    debt.reload
    assert_equal "personal", debt.mode
    assert_nil debt.upgrade_recipient_id
    assert_redirected_to notifications_path

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "upgrade_declined", notification.notification_type
  end

  test "cannot upgrade settled debt" do
    debt = debts(:personal_debt)
    debt.update!(status: "settled")

    post debt_upgrade_url(debt), params: { personal_id: users(:two).personal_id }

    debt.reload
    assert_nil debt.upgrade_recipient_id
    assert_redirected_to debt_path(debt)
  end
end
