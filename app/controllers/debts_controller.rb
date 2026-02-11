# frozen_string_literal: true

class DebtsController < InertiaController
  before_action :set_debt, only: %i[show confirm reject]
  before_action :authorize_debt_access!, only: :show
  before_action :authorize_confirmation!, only: %i[confirm reject]

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
      witnesses: @debt.witnesses.includes(:user).map { |w| witness_json(w) },
      current_user_id: current_user.id,
      is_confirming_party: confirming_party?,
      is_creator: creator_user(@debt)&.id == current_user.id,
      is_borrower: borrower_for_debt?,
      is_lender: @debt.lender_id == current_user.id,
      remaining_balance: remaining_balance.to_f,
      can_manage_witnesses: can_manage_witnesses?,
      is_invited_witness: invited_witness_id
    }
  end

  def confirm
    unless @debt.pending?
      redirect_to debt_path(@debt), alert: I18n.t("debts.already_processed")
      return
    end

    @debt.update!(status: "active")
    InstallmentScheduleGenerator.new(@debt).generate!
    notify_confirmation(@debt)

    redirect_to debt_path(@debt), notice: I18n.t("debts.confirmed")
  end

  def reject
    unless @debt.pending?
      redirect_to debt_path(@debt), alert: I18n.t("debts.already_processed")
      return
    end

    @debt.update!(status: "rejected")
    notify_rejection(@debt)

    redirect_to debt_path(@debt), notice: I18n.t("debts.rejected")
  end

  def index
    debts = filtered_debts
    debts = sorted_debts(debts)

    render inertia: "debts/Index", props: {
      debts: debts.includes(:lender, :borrower, :payments).map { |d| index_debt_json(d) },
      filters: {
        status: params[:status] || "all",
        mode: params[:mode] || "all",
        role: params[:role] || "all",
        sort: params[:sort] || "created_at_desc"
      }
    }
  end

  private

  def set_debt
    @debt = Debt.find(params[:id])
  end

  def authorize_confirmation!
    return if confirming_party?

    redirect_to debt_path(@debt), alert: I18n.t("debts.not_confirming_party")
  end

  def confirming_party?
    # The non-creator party is the confirming party
    if @debt.creator_role_lender?
      @debt.borrower_id == current_user.id
    else
      @debt.lender_id == current_user.id
    end
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

  def borrower_for_debt?
    if @debt.mutual?
      @debt.borrower_id == current_user.id
    else
      # Personal mode: the creator (lender_id) can submit payments
      @debt.lender_id == current_user.id
    end
  end

  def remaining_balance
    @debt.amount - @debt.payments.approved.sum(:amount)
  end

  def can_manage_witnesses?
    return false if @debt.settled? || @debt.rejected?

    creator_user(@debt)&.id == current_user.id
  end

  def invited_witness_id
    witness = @debt.witnesses.invited.find_by(user_id: current_user.id)
    witness&.id
  end

  def creator_user(debt)
    debt.creator_role_lender? ? debt.lender : debt.borrower
  end

  def notify_confirmation(debt)
    Notification.create!(
      user: creator_user(debt),
      notification_type: "debt_confirmed",
      message: I18n.t("notifications.debt_confirmed", confirmer: current_user.full_name, amount: debt.amount, currency: debt.currency),
      debt: debt
    )
  end

  def notify_rejection(debt)
    Notification.create!(
      user: creator_user(debt),
      notification_type: "debt_rejected",
      message: I18n.t("notifications.debt_rejected", rejecter: current_user.full_name, amount: debt.amount, currency: debt.currency),
      debt: debt
    )
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

  # --- index helpers ---

  def user_debts
    Debt.where(lender_id: current_user.id)
        .or(Debt.where(borrower_id: current_user.id))
  end

  def filtered_debts
    debts = user_debts

    debts = debts.where(status: params[:status]) if params[:status].present? && params[:status] != "all"
    debts = debts.where(mode: params[:mode]) if params[:mode].present? && params[:mode] != "all"

    if params[:role].present? && params[:role] != "all"
      debts = filter_by_role(debts)
    end

    debts
  end

  def filter_by_role(debts)
    case params[:role]
    when "lender"
      debts.where(lender_id: current_user.id)
    when "borrower"
      debts.where(borrower_id: current_user.id)
    else
      debts
    end
  end

  def sorted_debts(debts)
    case params[:sort]
    when "deadline_asc"
      debts.order(deadline: :asc)
    when "amount_desc"
      debts.order(amount: :desc)
    else
      debts.order(created_at: :desc)
    end
  end

  def index_debt_json(debt)
    approved_total = debt.payments.approved.sum(:amount).to_f
    progress = debt.amount.to_f > 0 ? ((approved_total / debt.amount.to_f) * 100).round(1) : 0

    {
      id: debt.id,
      counterparty_name: index_counterparty_name(debt),
      amount: debt.amount.to_f,
      currency: debt.currency,
      status: debt.status,
      mode: debt.mode,
      deadline: debt.deadline.to_s,
      progress: progress
    }
  end

  def index_counterparty_name(debt)
    if debt.personal?
      debt.counterparty_name
    elsif debt.lender_id == current_user.id
      debt.borrower&.full_name || "Unknown"
    else
      debt.lender.full_name
    end
  end
end
