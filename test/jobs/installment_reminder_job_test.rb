# frozen_string_literal: true

require "test_helper"

class InstallmentReminderJobTest < ActiveJob::TestCase
  include ActionMailer::TestHelper

  test "sends reminders for installments due in 3 days" do
    debt = debts(:mutual_debt)
    debt.installments.create!(
      amount: 500.00,
      due_date: 3.days.from_now.to_date,
      status: :upcoming
    )

    assert_difference "Notification.count", 2 do
      assert_enqueued_emails 2 do
        InstallmentReminderJob.perform_now
      end
    end

    notification = Notification.where(debt: debt, notification_type: "installment_reminder").last
    assert_includes notification.message, "500.0"
  end

  test "sends reminders for installments due in 1 day" do
    debt = debts(:mutual_debt)
    debt.installments.create!(
      amount: 200.00,
      due_date: 1.day.from_now.to_date,
      status: :upcoming
    )

    assert_difference "Notification.count", 2 do
      InstallmentReminderJob.perform_now
    end
  end

  test "sends reminders for installments due today" do
    debt = debts(:mutual_debt)
    debt.installments.create!(
      amount: 300.00,
      due_date: Date.current,
      status: :upcoming
    )

    assert_difference "Notification.count", 2 do
      InstallmentReminderJob.perform_now
    end
  end

  test "does not send reminders for installments not due soon" do
    # Existing fixtures have installments due in 15 and 30+ days — not in the reminder window
    assert_no_difference "Notification.count" do
      InstallmentReminderJob.perform_now
    end
  end

  test "does not send reminders for overdue installments" do
    debt = debts(:mutual_debt)
    debt.installments.create!(
      amount: 100.00,
      due_date: 3.days.from_now.to_date,
      status: :overdue
    )

    assert_no_difference "Notification.count" do
      InstallmentReminderJob.perform_now
    end
  end

  test "sends reminders to both lender and borrower" do
    debt = debts(:mutual_debt)
    debt.installments.create!(
      amount: 500.00,
      due_date: 3.days.from_now.to_date,
      status: :upcoming
    )

    InstallmentReminderJob.perform_now

    lender_notification = Notification.find_by(user: debt.lender, notification_type: "installment_reminder", debt: debt)
    borrower_notification = Notification.find_by(user: debt.borrower, notification_type: "installment_reminder", debt: debt)

    assert lender_notification, "Lender should receive a reminder"
    assert borrower_notification, "Borrower should receive a reminder"
  end
end
