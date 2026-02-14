# frozen_string_literal: true

class DebtsController < InertiaController
  include DebtCreatorHelper

  rate_limit to: 20, within: 1.hour, only: :create,
    by: -> { current_user.id },
    with: -> {
      redirect_to new_debt_path, alert: I18n.t("errors.rate_limit")
    }

  before_action :set_debt, only: %i[show confirm reject upgrade accept_upgrade decline_upgrade]
  before_action :authorize_debt_access!, only: :show
  before_action :authorize_confirmation!, only: %i[confirm reject]

  def new
  end

  def create
    debt = build_debt

    # Check if assign_mutual_parties failed (for mutual debts)
    if debt.errors.any?
      redirect_to new_debt_path, inertia: { errors: debt.errors.to_hash(true) }
      return
    end

    if debt.save
      after_create(debt)
      redirect_to debt_path(debt), notice: I18n.t("debts.created")
    else
      redirect_to new_debt_path, inertia: { errors: debt.errors.to_hash(true) }
    end
  end

  def show
    @pagy_installments, paginated_installments = pagy(@debt.installments.order(:due_date), limit: 10, page_param: :installments_page)

    render inertia: "debts/Show", props: {
      debt: debt_json(@debt),
      installments: paginated_installments.map { |i| installment_json(i) },
      installments_pagination: pagy_metadata(@pagy_installments),
      payments: @debt.payments.includes(:submitter, :installment).order(submitted_at: :desc).map { |p| payment_json(p) },
      witnesses: @debt.witnesses.includes(:user).map { |w| witness_json(w) },
      current_user_id: current_user.id,
      is_confirming_party: confirming_party?,
      is_creator: creator_user(@debt)&.id == current_user.id,
      is_borrower: borrower_for_debt?,
      is_lender: @debt.lender_id == current_user.id,
      remaining_balance: remaining_balance.to_f,
      can_manage_witnesses: can_manage_witnesses?,
      is_invited_witness: invited_witness_id,
      can_upgrade: can_upgrade?,
      is_upgrade_recipient: @debt.upgrade_recipient_id == current_user.id,
      upgrade_recipient_name: @debt.upgrade_recipient&.full_name
    }
  end

  def confirm
    ActiveRecord::Base.transaction do
      @debt.lock!

      unless @debt.pending?
        redirect_to debt_path(@debt), alert: I18n.t("debts.already_processed")
        return
      end

      @debt.update!(status: "active")
      InstallmentScheduleGenerator.new(@debt).generate!
      NotificationService.debt_confirmed(@debt, confirmer: current_user)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.confirmed")
  end

  def reject
    ActiveRecord::Base.transaction do
      @debt.lock!

      unless @debt.pending?
        redirect_to debt_path(@debt), alert: I18n.t("debts.already_processed")
        return
      end

      @debt.update!(status: "rejected")
      NotificationService.debt_rejected(@debt, rejecter: current_user)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.rejected")
  end

  def upgrade
    unless @debt.personal? && @debt.active? && creator_user(@debt)&.id == current_user.id
      redirect_to debt_path(@debt), alert: I18n.t("debts.upgrade_not_allowed")
      return
    end

    personal_id = params[:personal_id]&.upcase&.strip
    recipient = User.find_by(personal_id: personal_id)

    unless recipient
      redirect_to debt_path(@debt), alert: I18n.t("debts.upgrade_user_not_found")
      return
    end

    if recipient.id == current_user.id
      redirect_to debt_path(@debt), alert: I18n.t("debts.cannot_upgrade_to_self")
      return
    end

    if @debt.upgrade_recipient_id.present?
      redirect_to debt_path(@debt), alert: I18n.t("debts.upgrade_already_pending")
      return
    end

    ActiveRecord::Base.transaction do
      @debt.lock!
      @debt.update!(upgrade_recipient_id: recipient.id)
      NotificationService.upgrade_requested(@debt, recipient: recipient)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.upgrade_requested")
  end

  def accept_upgrade
    ActiveRecord::Base.transaction do
      @debt.lock!

      unless @debt.upgrade_recipient_id == current_user.id
        redirect_to debt_path(@debt), alert: I18n.t("debts.upgrade_not_recipient")
        return
      end

      if @debt.creator_role_lender?
        @debt.update!(mode: "mutual", borrower_id: current_user.id, upgrade_recipient_id: nil)
      else
        @debt.update!(mode: "mutual", lender_id: current_user.id, upgrade_recipient_id: nil)
      end

      NotificationService.upgrade_accepted(@debt, accepter: current_user)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.upgrade_accepted")
  end

  def decline_upgrade
    ActiveRecord::Base.transaction do
      @debt.lock!

      unless @debt.upgrade_recipient_id == current_user.id
        redirect_to debt_path(@debt), alert: I18n.t("debts.upgrade_not_recipient")
        return
      end

      @debt.update!(upgrade_recipient_id: nil)
      NotificationService.upgrade_declined(@debt, decliner: current_user)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.upgrade_declined")
  end

  def index
    debts = filtered_debts
    debts = sorted_debts(debts)

    @pagy, paginated_debts = pagy(debts.includes(:lender, :borrower, :payments), limit: 20)

    render inertia: "debts/Index", props: {
      debts: paginated_debts.map { |d| index_debt_json(d) },
      pagination: pagy_metadata(@pagy),
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
    @debt = Debt.includes(:lender, :borrower, :upgrade_recipient).find(params[:id])
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
    return if @debt.upgrade_recipient_id == current_user.id
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
      upgrade_recipient_id: debt.upgrade_recipient_id,
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
      installment_id: payment.installment_id,
      self_reported: payment.submitter_id == @debt.lender_id && payment.status == "approved" && @debt.personal?
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

    # Issue #4: Check if counterparty was found
    if counterparty_id.nil?
      debt.errors.add(:counterparty_personal_id, "not found")
      return false
    end

    # Issue #3: Check if user is creating debt with themselves
    if counterparty_id == current_user.id
      debt.errors.add(:counterparty_personal_id, "cannot create a debt with yourself")
      return false
    end

    if debt.creator_role_lender?
      debt.lender = current_user
      debt.borrower_id = counterparty_id
    else
      debt.borrower = current_user
      debt.lender_id = counterparty_id
    end

    true
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
      NotificationService.debt_created(debt)
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

  def can_upgrade?
    @debt.personal? && @debt.active? && @debt.upgrade_recipient_id.nil? && creator_user(@debt)&.id == current_user.id
  end


  # --- index helpers ---

  def user_debts
    Debt.where(lender_id: current_user.id)
        .or(Debt.where(borrower_id: current_user.id))
        .or(Debt.where(upgrade_recipient_id: current_user.id))
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
    # Use Ruby's sum on preloaded collection instead of DB query
    approved_total = debt.payments.select(&:approved?).sum(&:amount).to_f
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

  def pagy_metadata(pagy)
    {
      page: pagy.page,
      last: pagy.last,
      prev: pagy.prev,
      next: pagy.next,
      pages: pagy.pages,
      count: pagy.count,
      from: pagy.from,
      to: pagy.to
    }
  end
end
