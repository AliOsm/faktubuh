# frozen_string_literal: true

require "test_helper"

class OverdueDetectionJobTest < ActiveJob::TestCase
  include ActionMailer::TestHelper
  test "marks overdue installments and notifies both parties" do
    debt = debts(:mutual_debt)
    installment = debt.installments.create!(
      amount: 500.00,
      due_date: 1.day.ago.to_date,
      status: :upcoming
    )

    assert_difference "Notification.count", 2 do
      assert_enqueued_emails 2 do
        OverdueDetectionJob.perform_now
      end
    end

    installment.reload
    assert_equal "overdue", installment.status
  end

  test "does not re-process already overdue installments" do
    debt = debts(:mutual_debt)
    debt.installments.create!(
      amount: 500.00,
      due_date: 1.day.ago.to_date,
      status: :overdue
    )

    assert_no_difference "Notification.count" do
      OverdueDetectionJob.perform_now
    end
  end

  test "does not mark future installments as overdue" do
    # Existing fixtures have installments with future due_dates
    upcoming_count = Installment.upcoming.count
    OverdueDetectionJob.perform_now
    assert_equal upcoming_count, Installment.upcoming.count
  end

  test "handles personal debts with no borrower" do
    debt = debts(:personal_debt)
    installment = debt.installments.create!(
      amount: 100.00,
      due_date: 2.days.ago.to_date,
      status: :upcoming
    )

    # Personal debt has no borrower, so only lender gets notified
    assert_difference "Notification.count", 1 do
      OverdueDetectionJob.perform_now
    end

    installment.reload
    assert_equal "overdue", installment.status
  end

  test "sends overdue notifications to correct users" do
    debt = debts(:mutual_debt)
    debt.installments.create!(
      amount: 500.00,
      due_date: 1.day.ago.to_date,
      status: :upcoming
    )

    OverdueDetectionJob.perform_now

    lender_notification = Notification.find_by(user: debt.lender, notification_type: "installment_overdue", debt: debt)
    borrower_notification = Notification.find_by(user: debt.borrower, notification_type: "installment_overdue", debt: debt)

    assert lender_notification, "Lender should receive overdue notification"
    assert borrower_notification, "Borrower should receive overdue notification"
    assert_includes lender_notification.message, "500.0"
  end
end
