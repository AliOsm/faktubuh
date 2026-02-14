# frozen_string_literal: true

class Debts::ConfirmationsController < InertiaController
  before_action :set_debt
  before_action :authorize_confirming_party!

  def create
    ActiveRecord::Base.transaction do
      @debt.lock!

      unless @debt.pending?
        redirect_to debt_path(@debt), alert: I18n.t("debts.already_processed")
        return
      end

      @debt.update!(status: "active")
      InstallmentScheduleGenerator.new(@debt).generate!(start_date: Time.zone.today)
      NotificationService.debt_confirmed(@debt, confirmer: current_user)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.confirmed")
  end

  def destroy
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

  private

  def set_debt
    @debt = Debt.includes(:lender, :borrower).find(params[:debt_id])
  end

  def authorize_confirming_party!
    return if @debt.confirming_party?(current_user)

    redirect_to debt_path(@debt), alert: I18n.t("debts.not_confirming_party")
  end
end
