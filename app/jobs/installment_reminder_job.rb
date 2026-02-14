# frozen_string_literal: true

class InstallmentReminderJob < ApplicationJob
  queue_as :default

  def perform
    reminder_dates = [ 3.days.from_now.to_date, 1.day.from_now.to_date, Date.current ]

    reminder_dates.each do |date|
      Installment.upcoming
                 .joins(:debt)
                 .merge(Debt.active)
                 .where(due_date: date)
                 .includes(debt: [ :lender, :borrower ])
                 .find_each do |installment|
        next if already_reminded?(installment, date)

        debt = installment.debt
        recipients = [ debt.lender, debt.borrower ].compact

        recipients.each do |recipient|
          days_until = (installment.due_date - Date.current).to_i
          params = {
            amount: installment.amount.to_s,
            currency: debt.currency,
            days: days_until.to_s,
            installment_id: installment.id.to_s,
            due_date: date.to_s
          }
          message = I18n.t("notifications.installment_reminder", locale: :en, amount: params[:amount], currency: params[:currency], days: params[:days])

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

  private

  def already_reminded?(installment, due_date)
    Notification
      .where(debt: installment.debt)
      .where(notification_type: "installment_reminder")
      .where("params->>'installment_id' = ?", installment.id.to_s)
      .where("params->>'due_date' = ?", due_date.to_s)
      .where("created_at > ?", 12.hours.ago)
      .exists?
  end
end
