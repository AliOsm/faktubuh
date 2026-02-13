# frozen_string_literal: true

class InstallmentReminderJob < ApplicationJob
  queue_as :default

  def perform
    reminder_dates = [ 3.days.from_now.to_date, 1.day.from_now.to_date, Date.current ]

    Installment.upcoming.where(due_date: reminder_dates).includes(debt: [ :lender, :borrower ]).find_each do |installment|
      debt = installment.debt
      recipients = [ debt.lender, debt.borrower ].compact

      recipients.each do |recipient|
        days_until = (installment.due_date - Date.current).to_i
        params = { amount: installment.amount.to_s, currency: debt.currency, days: days_until.to_s }
        message = I18n.t("notifications.installment_reminder", locale: :en, **params)

        Notification.create!(
          user: recipient,
          notification_type: "installment_reminder",
          message: message,
          params: params,
          debt: debt
        )

        DebtMailer.installment_reminder(installment, recipient).deliver_later
      end
    end
  end
end
