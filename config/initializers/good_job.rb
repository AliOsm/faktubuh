# frozen_string_literal: true

Rails.application.configure do
  config.good_job.enable_cron = true
  config.good_job.cron = {
    overdue_detection: {
      cron: "0 0 * * *", # daily at midnight UTC
      class: "OverdueDetectionJob",
      description: "Mark overdue installments and notify both parties"
    },
    installment_reminder: {
      cron: "0 8 * * *", # daily at 8:00 AM UTC
      class: "InstallmentReminderJob",
      description: "Send reminders for installments due in 3 days, 1 day, or today"
    }
  }
end
