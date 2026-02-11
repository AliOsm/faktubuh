# frozen_string_literal: true

class NotificationService
  class << self
    def debt_created(debt)
      other_user = debt.creator_role_lender? ? debt.borrower : debt.lender
      return unless other_user

      creator = debt.creator_role_lender? ? debt.lender : debt.borrower
      create_notification(
        user: other_user,
        notification_type: "debt_created",
        message: I18n.t("notifications.debt_created", creator: creator.full_name, amount: debt.amount, currency: debt.currency),
        debt: debt
      )
    end

    def debt_confirmed(debt, confirmer:)
      creator = debt.creator_role_lender? ? debt.lender : debt.borrower
      return unless creator

      create_notification(
        user: creator,
        notification_type: "debt_confirmed",
        message: I18n.t("notifications.debt_confirmed", confirmer: confirmer.full_name, amount: debt.amount, currency: debt.currency),
        debt: debt
      )
    end

    def debt_rejected(debt, rejecter:)
      creator = debt.creator_role_lender? ? debt.lender : debt.borrower
      return unless creator

      create_notification(
        user: creator,
        notification_type: "debt_rejected",
        message: I18n.t("notifications.debt_rejected", rejecter: rejecter.full_name, amount: debt.amount, currency: debt.currency),
        debt: debt
      )
    end

    def payment_submitted(payment)
      debt = payment.debt
      create_notification(
        user: debt.lender,
        notification_type: "payment_submitted",
        message: I18n.t("notifications.payment_submitted", submitter: payment.submitter.full_name, amount: payment.amount, currency: debt.currency),
        debt: debt
      )
    end

    def payment_approved(payment)
      debt = payment.debt
      create_notification(
        user: payment.submitter,
        notification_type: "payment_approved",
        message: I18n.t("notifications.payment_approved", amount: payment.amount, currency: debt.currency),
        debt: debt
      )
    end

    def payment_rejected(payment)
      debt = payment.debt
      create_notification(
        user: payment.submitter,
        notification_type: "payment_rejected",
        message: I18n.t("notifications.payment_rejected", amount: payment.amount, currency: debt.currency, reason: payment.rejection_reason),
        debt: debt
      )
    end

    def witness_invited(witness)
      debt = witness.debt
      creator = debt.creator_role_lender? ? debt.lender : debt.borrower
      create_notification(
        user: witness.user,
        notification_type: "witness_invited",
        message: I18n.t("notifications.witness_invited", inviter: creator.full_name, amount: debt.amount, currency: debt.currency),
        debt: debt
      )
    end

    def witness_confirmed(witness)
      debt = witness.debt
      creator = debt.creator_role_lender? ? debt.lender : debt.borrower
      return unless creator

      create_notification(
        user: creator,
        notification_type: "witness_confirmed",
        message: I18n.t("notifications.witness_confirmed", witness: witness.user.full_name, amount: debt.amount, currency: debt.currency),
        debt: debt
      )
    end

    def witness_declined(witness)
      debt = witness.debt
      creator = debt.creator_role_lender? ? debt.lender : debt.borrower
      return unless creator

      create_notification(
        user: creator,
        notification_type: "witness_declined",
        message: I18n.t("notifications.witness_declined", witness: witness.user.full_name, amount: debt.amount, currency: debt.currency),
        debt: debt
      )
    end

    def debt_settled(debt)
      [ debt.lender, debt.borrower ].compact.each do |user|
        create_notification(
          user: user,
          notification_type: "debt_settled",
          message: I18n.t("notifications.debt_settled", amount: debt.amount, currency: debt.currency),
          debt: debt
        )
      end
    end

    private

    def create_notification(user:, notification_type:, message:, debt:)
      Notification.create!(
        user: user,
        notification_type: notification_type,
        message: message,
        debt: debt
      )
    end
  end
end
