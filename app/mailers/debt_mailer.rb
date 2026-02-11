# frozen_string_literal: true

class DebtMailer < ApplicationMailer
  def debt_created(debt, recipient)
    @debt = debt
    @recipient = recipient
    @counterparty = counterparty_for(debt, recipient)

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.debt_created.subject", amount: debt.amount, currency: debt.currency)
      )
    end
  end

  def debt_confirmed(debt, recipient)
    @debt = debt
    @recipient = recipient
    @counterparty = counterparty_for(debt, recipient)

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.debt_confirmed.subject", amount: debt.amount, currency: debt.currency)
      )
    end
  end

  def payment_submitted(payment, recipient)
    @payment = payment
    @debt = payment.debt
    @recipient = recipient
    @submitter = payment.submitter

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.payment_submitted.subject", amount: payment.amount, currency: @debt.currency)
      )
    end
  end

  def payment_approved(payment, recipient)
    @payment = payment
    @debt = payment.debt
    @recipient = recipient

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.payment_approved.subject", amount: payment.amount, currency: @debt.currency)
      )
    end
  end

  def payment_rejected(payment, recipient)
    @payment = payment
    @debt = payment.debt
    @recipient = recipient

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.payment_rejected.subject", amount: payment.amount, currency: @debt.currency)
      )
    end
  end

  def witness_invitation(witness)
    @witness = witness
    @debt = witness.debt
    @recipient = witness.user
    @inviter = @debt.creator_role_lender? ? @debt.lender : @debt.borrower

    I18n.with_locale(@recipient.locale) do
      mail(
        to: @recipient.email,
        subject: I18n.t("debt_mailer.witness_invitation.subject", amount: @debt.amount, currency: @debt.currency)
      )
    end
  end

  def installment_reminder(installment, recipient)
    @installment = installment
    @debt = installment.debt
    @recipient = recipient
    @counterparty = counterparty_for(@debt, recipient)
    @days_until = (installment.due_date - Date.current).to_i

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.installment_reminder.subject", amount: installment.amount, currency: @debt.currency, days: @days_until)
      )
    end
  end

  def overdue_notice(installment, recipient)
    @installment = installment
    @debt = installment.debt
    @recipient = recipient
    @counterparty = counterparty_for(@debt, recipient)

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.overdue_notice.subject", amount: installment.amount, currency: @debt.currency)
      )
    end
  end

  def debt_settled(debt, recipient)
    @debt = debt
    @recipient = recipient
    @counterparty = counterparty_for(debt, recipient)

    I18n.with_locale(recipient.locale) do
      mail(
        to: recipient.email,
        subject: I18n.t("debt_mailer.debt_settled.subject", amount: debt.amount, currency: debt.currency)
      )
    end
  end

  private

  def counterparty_for(debt, recipient)
    if debt.lender_id == recipient.id
      debt.borrower || Struct.new(:full_name).new(debt.counterparty_name)
    else
      debt.lender
    end
  end
end
