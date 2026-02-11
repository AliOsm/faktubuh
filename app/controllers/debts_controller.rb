# frozen_string_literal: true

class DebtsController < InertiaController
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
  end

  def index
  end

  private

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
