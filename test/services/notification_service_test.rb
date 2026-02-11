# frozen_string_literal: true

require "test_helper"

class NotificationServiceTest < ActiveSupport::TestCase
  setup do
    @lender = users(:one)
    @borrower = users(:two)
    @mutual_debt = debts(:mutual_debt)
    @personal_debt = debts(:personal_debt)
  end

  test "debt_created notifies the other party" do
    assert_difference "Notification.count", 1 do
      NotificationService.debt_created(@mutual_debt)
    end

    notification = Notification.last
    assert_equal @borrower.id, notification.user_id
    assert_equal "debt_created", notification.notification_type
    assert_equal @mutual_debt.id, notification.debt_id
    assert_includes notification.message, @lender.full_name
  end

  test "debt_confirmed notifies the creator" do
    assert_difference "Notification.count", 1 do
      NotificationService.debt_confirmed(@mutual_debt, confirmer: @borrower)
    end

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "debt_confirmed", notification.notification_type
    assert_includes notification.message, @borrower.full_name
  end

  test "debt_rejected notifies the creator" do
    assert_difference "Notification.count", 1 do
      NotificationService.debt_rejected(@mutual_debt, rejecter: @borrower)
    end

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "debt_rejected", notification.notification_type
    assert_includes notification.message, @borrower.full_name
  end

  test "payment_submitted notifies the lender" do
    payment = payments(:pending_payment)

    assert_difference "Notification.count", 1 do
      NotificationService.payment_submitted(payment)
    end

    notification = Notification.last
    assert_equal @mutual_debt.lender_id, notification.user_id
    assert_equal "payment_submitted", notification.notification_type
  end

  test "payment_approved notifies the submitter" do
    payment = payments(:pending_payment)

    assert_difference "Notification.count", 1 do
      NotificationService.payment_approved(payment)
    end

    notification = Notification.last
    assert_equal payment.submitter_id, notification.user_id
    assert_equal "payment_approved", notification.notification_type
  end

  test "payment_rejected notifies the submitter" do
    payment = payments(:pending_payment)
    payment.update!(rejection_reason: "Invalid receipt")

    assert_difference "Notification.count", 1 do
      NotificationService.payment_rejected(payment)
    end

    notification = Notification.last
    assert_equal payment.submitter_id, notification.user_id
    assert_equal "payment_rejected", notification.notification_type
    assert_includes notification.message, "Invalid receipt"
  end

  test "witness_invited notifies the witness user" do
    witness = witnesses(:invited_witness)

    assert_difference "Notification.count", 1 do
      NotificationService.witness_invited(witness)
    end

    notification = Notification.last
    assert_equal witness.user_id, notification.user_id
    assert_equal "witness_invited", notification.notification_type
  end

  test "witness_confirmed notifies the debt creator" do
    witness = witnesses(:confirmed_witness)

    assert_difference "Notification.count", 1 do
      NotificationService.witness_confirmed(witness)
    end

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "witness_confirmed", notification.notification_type
    assert_includes notification.message, witness.user.full_name
  end

  test "debt_settled notifies both parties" do
    assert_difference "Notification.count", 2 do
      NotificationService.debt_settled(@mutual_debt)
    end

    notifications = Notification.last(2)
    user_ids = notifications.map(&:user_id)
    assert_includes user_ids, @lender.id
    assert_includes user_ids, @borrower.id
    assert notifications.all? { |n| n.notification_type == "debt_settled" }
  end

  test "debt_settled on personal debt notifies only lender" do
    assert_difference "Notification.count", 1 do
      NotificationService.debt_settled(@personal_debt)
    end

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "debt_settled", notification.notification_type
  end
end
