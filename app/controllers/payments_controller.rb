# frozen_string_literal: true

class PaymentsController < InertiaController
  before_action :set_debt
  before_action :authorize_payment_creation!

  def create
    @payment = @debt.payments.new(payment_params)
    @payment.submitter = current_user
    @payment.submitted_at = Time.current
    @payment.status = @debt.personal? ? "approved" : "pending"

    if @payment.save
      notify_payment_submitted(@payment) if @debt.mutual?
      redirect_to debt_path(@debt), notice: I18n.t("payments.submitted")
    else
      redirect_to debt_path(@debt), inertia: { errors: @payment.errors.to_hash(true) }
    end
  end

  private

  def set_debt
    @debt = Debt.find(params[:debt_id])
  end

  def authorize_payment_creation!
    unless @debt.active?
      redirect_to debt_path(@debt), alert: I18n.t("payments.debt_not_active")
      return
    end

    unless borrower_user?
      redirect_to debt_path(@debt), alert: I18n.t("payments.not_borrower")
      nil
    end
  end

  def borrower_user?
    if @debt.mutual?
      @debt.borrower_id == current_user.id
    else
      # Personal mode: the creator is the only user — they can submit payments
      @debt.lender_id == current_user.id
    end
  end

  def payment_params
    params.require(:payment).permit(:amount, :description, :installment_id)
  end

  def remaining_balance
    @debt.amount - @debt.payments.approved.sum(:amount)
  end

  def notify_payment_submitted(payment)
    Notification.create!(
      user: @debt.lender,
      notification_type: "payment_submitted",
      message: I18n.t(
        "notifications.payment_submitted",
        submitter: current_user.full_name,
        amount: payment.amount,
        currency: @debt.currency
      ),
      debt: @debt
    )
  end
end
