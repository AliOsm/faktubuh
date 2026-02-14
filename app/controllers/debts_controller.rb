# frozen_string_literal: true

class DebtsController < InertiaController
  rate_limit to: 20, within: 1.hour, only: :create,
    by: -> { current_user.id },
    with: -> {
      redirect_to new_debt_path, alert: I18n.t("errors.rate_limit")
    }

  before_action :set_debt, only: :show
  before_action :authorize_debt_access!, only: :show

  def new
  end

  def create
    result = Debts::Create.new(
      params: debt_params,
      creator_role: params[:debt][:creator_role],
      counterparty_personal_id: params[:debt][:counterparty_personal_id],
      current_user:
    ).call

    if result.success?
      redirect_to debt_path(result.debt), notice: I18n.t("debts.created")
    else
      redirect_to new_debt_path, inertia: { errors: result.errors }
    end
  end

  def show
    @pagy_installments, paginated_installments = pagy(
      @debt.installments.order(:due_date), limit: 10, page_param: :installments_page
    )

    render inertia: "debts/Show", props: {
      debt: @debt.as_json(
        only: %i[id mode creator_role status amount currency description deadline
                 installment_type counterparty_name upgrade_recipient_id created_at],
        include: {
          lender: { only: %i[id full_name personal_id] },
          borrower: { only: %i[id full_name personal_id] },
          witnesses: { only: %i[id status confirmed_at], methods: %i[user_name] }
        }
      ),
      installments: paginated_installments.as_json(only: %i[id amount due_date status description]),
      installments_pagination: pagy_json(@pagy_installments),
      payments: @debt.payments.includes(:submitter, :installment).order(submitted_at: :desc).as_json(
        only: %i[id amount submitted_at status description rejection_reason installment_id],
        methods: %i[submitter_name self_reported]
      ),
      current_user_id: current_user.id,
      is_confirming_party: @debt.confirming_party?(current_user),
      is_creator: @debt.creator&.id == current_user.id,
      is_borrower: @debt.borrower_for?(current_user),
      is_lender: @debt.lender_id == current_user.id,
      remaining_balance: @debt.remaining_balance.to_f,
      can_manage_witnesses: @debt.can_manage_witnesses?(current_user),
      is_invited_witness: @debt.witnesses.invited.find_by(user_id: current_user.id)&.id,
      can_upgrade: @debt.can_upgrade?(current_user),
      is_upgrade_recipient: @debt.upgrade_recipient_id == current_user.id,
      upgrade_recipient_name: @debt.upgrade_recipient&.full_name
    }
  end

  def index
    debts = filtered_debts
    @pagy, paginated_debts = pagy(debts.includes(:lender, :borrower, :payments), limit: 20)

    render inertia: "debts/Index", props: {
      debts: paginated_debts.map { |debt|
        debt.as_json(only: %i[id amount currency status mode deadline]).merge(
          "counterparty_name" => debt.counterparty_name_for(current_user),
          "progress" => debt.payment_progress
        )
      },
      pagination: pagy_json(@pagy),
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
    @debt = Debt.includes(:lender, :borrower, :upgrade_recipient, witnesses: :user).find(params[:id])
  end

  def authorize_debt_access!
    return if @debt.lender_id == current_user.id
    return if @debt.borrower_id == current_user.id
    return if @debt.upgrade_recipient_id == current_user.id
    return if @debt.witnesses.where(status: %w[invited confirmed]).exists?(user_id: current_user.id)

    redirect_to debts_path, alert: I18n.t("debts.unauthorized")
  end

  def debt_params
    params.require(:debt).permit(
      :mode, :amount, :currency, :deadline, :description,
      :installment_type, :counterparty_name
    )
  end

  def pagy_json(pagy)
    { page: pagy.page, last: pagy.last, prev: pagy.prev, next: pagy.next,
      pages: pagy.pages, count: pagy.count, from: pagy.from, to: pagy.to }
  end

  def filtered_debts
    debts = Debt.for_user(current_user)
    debts = debts.where(status: params[:status]) if params[:status].present? && params[:status] != "all"
    debts = debts.where(mode: params[:mode]) if params[:mode].present? && params[:mode] != "all"
    debts = filter_by_role(debts) if params[:role].present? && params[:role] != "all"
    debts.sorted_by(params[:sort])
  end

  def filter_by_role(debts)
    case params[:role]
    when "lender"   then debts.as_lender_for(current_user)
    when "borrower" then debts.as_borrower_for(current_user)
    else debts
    end
  end
end
