# frozen_string_literal: true

class DebtsController < InertiaController
  before_action :set_debt, only: :show
  before_action :authorize_debt_access!, only: :show

  def new
  end

  def create
    @debt = build_debt

    if @debt.save
      after_create(@debt)
      redirect_to debt_path(@debt), notice: I18n.t("debts.created")
    else
      redirect_to new_debt_path, inertia: { errors: @debt.errors.to_hash(true) }
    end
  end

  def show
    render inertia: "debts/Show", props: {
      debt: debt_json(@debt),
      installments: @debt.installments.order(:due_date).map { |i| installment_json(i) },
      payments: @debt.payments.includes(:submitter, :installment).order(submitted_at: :desc).map { |p| payment_json(p) },
      witnesses: @debt.witnesses.includes(:user).map { |w| witness_json(w) }
    }
  end

  def index
  end

  private

  def set_debt
    @debt = Debt.find(params[:id])
  end

  def authorize_debt_access!
    return if @debt.lender_id == current_user.id
    return if @debt.borrower_id == current_user.id
    return if @debt.witnesses.confirmed.exists?(user_id: current_user.id)

    redirect_to debts_path, alert: I18n.t("debts.unauthorized")
  end

  def debt_json(debt)
    {
      id: debt.id,
      mode: debt.mode,
      creator_role: debt.creator_role,
      status: debt.status,
      amount: debt.amount.to_f,
      currency: debt.currency,
      description: debt.description,
      deadline: debt.deadline.to_s,
      installment_type: debt.installment_type,
      counterparty_name: debt.counterparty_name,
      lender: user_summary(debt.lender),
      borrower: debt.borrower ? user_summary(debt.borrower) : nil,
      created_at: debt.created_at.iso8601
    }
  end

  def user_summary(user)
    { id: user.id, full_name: user.full_name, personal_id: user.personal_id }
  end

  def installment_json(installment)
    {
      id: installment.id,
      amount: installment.amount.to_f,
      due_date: installment.due_date.to_s,
      status: installment.status,
      description: installment.description
    }
  end

  def payment_json(payment)
    {
      id: payment.id,
      amount: payment.amount.to_f,
      submitted_at: payment.submitted_at.iso8601,
      status: payment.status,
      description: payment.description,
      rejection_reason: payment.rejection_reason,
      submitter_name: payment.submitter.full_name,
      installment_id: payment.installment_id
    }
  end

  def witness_json(witness)
    {
      id: witness.id,
      user_name: witness.user.full_name,
      status: witness.status,
      confirmed_at: witness.confirmed_at&.iso8601
    }
  end

  def build_debt
    debt = Debt.new(debt_params)
    debt.creator_role = params[:debt][:creator_role]

    if debt.mutual?
      assign_mutual_parties(debt)
    else
      # Personal mode: current_user is always lender_id (NOT NULL constraint).
      # creator_role tracks their actual role; counterparty_name is the other party.
      debt.lender = current_user
    end

    debt.status = debt.mutual? ? "pending" : "active"
    debt
  end

  def assign_mutual_parties(debt)
    counterparty_id = resolve_counterparty_id

    if debt.creator_role_lender?
      debt.lender = current_user
      debt.borrower_id = counterparty_id
    else
      debt.borrower = current_user
      debt.lender_id = counterparty_id
    end
  end

  def debt_params
    params.require(:debt).permit(
      :mode, :amount, :currency, :deadline, :description,
      :installment_type, :counterparty_name
    )
  end

  def resolve_counterparty_id
    personal_id = params[:debt][:counterparty_personal_id]&.upcase&.strip
    user = User.find_by(personal_id: personal_id)
    user&.id
  end

  def after_create(debt)
    if debt.personal?
      InstallmentScheduleGenerator.new(debt).generate!
    elsif debt.mutual?
      notify_other_party(debt)
    end
  end

  def notify_other_party(debt)
    other_user = debt.creator_role_lender? ? debt.borrower : debt.lender
    return unless other_user

    Notification.create!(
      user: other_user,
      notification_type: "debt_created",
      message: I18n.t("notifications.debt_created", creator: current_user.full_name, amount: debt.amount, currency: debt.currency),
      debt: debt
    )
  end
end
