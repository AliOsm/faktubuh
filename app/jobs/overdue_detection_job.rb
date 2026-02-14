# frozen_string_literal: true

class OverdueDetectionJob < ApplicationJob
  queue_as :default

  def perform
    Installment.upcoming
               .joins(:debt)
               .merge(Debt.active)
               .where("installments.due_date < ?", Date.current)
               .includes(debt: [ :lender, :borrower ])
               .find_each do |installment|
      next if already_notified?(installment)

      installment.update!(status: :overdue)

      debt = installment.debt
      recipients = [ debt.lender, debt.borrower ].compact

      recipients.each do |recipient|
        params = { amount: installment.amount.to_s, currency: debt.currency }
        message = I18n.t("notifications.installment_overdue", locale: :en, **params)

        Notification.create!(
          user: recipient,
          notification_type: "installment_overdue",
          message: message,
          params: params.merge(installment_id: installment.id.to_s),
          debt: debt
        )

        DebtMailer.overdue_notice(installment, recipient).deliver_later
      end
    end
  end

  private

  def already_notified?(installment)
    # Check if ANY recipient (lender or borrower) was notified in the last 24 hours
    # This prevents duplicate notifications to all parties
    Notification
      .where(notification_type: "installment_overdue")
      .where("params->>'installment_id' = ?", installment.id.to_s)
      .where("created_at > ?", 24.hours.ago)
      .exists?
  end
end
