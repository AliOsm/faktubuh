# frozen_string_literal: true

class PaymentsController < InertiaController
  rate_limit to: 10, within: 1.hour, only: :create,
    by: -> { current_user.id },
    with: -> {
      redirect_to debt_path(params[:debt_id]), alert: I18n.t("errors.rate_limit")
    }

  before_action :set_debt
  before_action :set_payment, only: %i[approve reject]
  before_action :authorize_payment_creation!, only: :create
  before_action :authorize_lender!, only: %i[approve reject]
  before_action :authorize_pending_payment!, only: %i[approve reject]

  def create
    ActiveRecord::Base.transaction do
      @debt.lock!  # FOR UPDATE lock prevents concurrent modifications

      @payment = @debt.payments.new(payment_params)
      @payment.submitter = current_user
      @payment.submitted_at = Time.current
      @payment.status = @debt.personal? ? "approved" : "pending"
      @payment.skip_balance_validation = true  # We check manually with lock

      unless @payment.valid?
        redirect_to debt_path(@debt), inertia: { errors: @payment.errors.to_hash(true) }
        return
      end

      # Check remaining balance inside transaction to prevent race condition
      remaining = @debt.amount - @debt.payments.approved.sum(:amount)
      if @payment.amount > remaining
        @payment.errors.add(:amount, "exceeds remaining balance of #{remaining}")
        redirect_to debt_path(@debt), inertia: { errors: @payment.errors.to_hash(true) }
        return
      end

      if @payment.save
        if @payment.installment
          @payment.installment.lock!
          sync_installment_status!(@payment.installment)
        end

        NotificationService.payment_submitted(@payment) if @debt.mutual?
        check_auto_settlement
        redirect_to debt_path(@debt), notice: I18n.t("payments.submitted")
      else
        redirect_to debt_path(@debt), inertia: { errors: @payment.errors.to_hash(true) }
      end
    end
  end

  def approve
    ActiveRecord::Base.transaction do
      @debt.lock!
      @payment.lock!

      unless @payment.pending?
        redirect_to debt_path(@debt), alert: I18n.t("payments.not_pending")
        return
      end

      remaining = remaining_balance
      if @payment.amount > remaining
        redirect_to debt_path(@debt), alert: I18n.t("payments.exceeds_remaining_balance", remaining: format("%.2f", remaining))
        return
      end

      @payment.update!(status: "approved")

      if @payment.installment
        @payment.installment.lock!
        sync_installment_status!(@payment.installment)
      end

      NotificationService.payment_approved(@payment)
      check_auto_settlement
    end

    redirect_to debt_path(@debt), notice: I18n.t("payments.approved")
  end

  def reject
    ActiveRecord::Base.transaction do
      @debt.lock!
      @payment.lock!

      unless @payment.pending?
        redirect_to debt_path(@debt), alert: I18n.t("payments.not_pending")
        return
      end

      @payment.update!(
        status: "rejected",
        rejection_reason: params[:rejection_reason]
      )

      if @payment.installment
        @payment.installment.lock!
        sync_installment_status!(@payment.installment)
      end

      NotificationService.payment_rejected(@payment)
    end

    redirect_to debt_path(@debt), notice: I18n.t("payments.rejected")
  end

  private

  def set_debt
    @debt = Debt.find(params[:debt_id])
  end

  def set_payment
    @payment = @debt.payments.find(params[:id])
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

  def authorize_lender!
    return if @debt.lender_id == current_user.id

    redirect_to debt_path(@debt), alert: I18n.t("payments.not_lender")
  end

  def authorize_pending_payment!
    return if @payment.pending?

    redirect_to debt_path(@debt), alert: I18n.t("payments.not_pending")
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
    params.require(:payment).permit(:amount, :description, :installment_id, :rejection_reason)
  end

  def remaining_balance
    @debt.amount - @debt.payments.approved.sum(:amount)
  end

  def check_auto_settlement
    return unless remaining_balance <= 0
    return if @debt.settled?

    @debt.update!(status: "settled")
    @debt.installments.update_all(status: "approved") # rubocop:disable Rails/SkipsModelValidations
    NotificationService.debt_settled(@debt)
  end

  def sync_installment_status!(installment)
    approved_total = installment.payments.approved.sum(:amount)

    new_status =
      if approved_total >= installment.amount
        "approved"
      elsif installment.payments.pending.exists?
        "submitted"
      elsif installment.due_date < Date.current
        "overdue"
      else
        "upcoming"
      end

    return if installment.status == new_status

    installment.update!(status: new_status)
  end
end
