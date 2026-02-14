class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "faktubuh@gmail.com")
  layout "mailer"
end
