# frozen_string_literal: true

class OverdueDetectionJob < ApplicationJob
  queue_as :default

  def perform
    Installment.upcoming.where("due_date < ?", Date.current).includes(debt: [ :lender, :borrower ]).find_each do |installment|
      installment.update!(status: :overdue)

      debt = installment.debt
      recipients = [ debt.lender, debt.borrower ].compact

      recipients.each do |recipient|
        message = I18n.t(
          "notifications.installment_overdue",
          amount: installment.amount,
          currency: debt.currency
        )

        Notification.create!(
          user: recipient,
          notification_type: "installment_overdue",
          message: message,
          debt: debt
        )

        DebtMailer.overdue_notice(installment, recipient).deliver_later
      end
    end
  end
end
