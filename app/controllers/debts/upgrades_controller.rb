# frozen_string_literal: true

class Debts::UpgradesController < InertiaController
  before_action :set_debt
  before_action :authorize_upgrade_recipient!, only: %i[update destroy]

  def create
    unless @debt.personal? && @debt.active? && @debt.creator&.id == current_user.id
      redirect_to debt_path(@debt), alert: I18n.t("debts.upgrade_not_allowed")
      return
    end

    personal_id = params[:personal_id]&.upcase&.strip
    recipient = User.find_by(personal_id:)

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
      NotificationService.upgrade_requested(@debt, recipient:)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.upgrade_requested")
  end

  def update
    ActiveRecord::Base.transaction do
      @debt.lock!

      creator_id = @debt.lender_id
      if @debt.creator_role_lender?
        @debt.update!(mode: "mutual", borrower_id: current_user.id, upgrade_recipient_id: nil)
      else
        @debt.update!(mode: "mutual", lender_id: current_user.id, borrower_id: creator_id, upgrade_recipient_id: nil)
      end

      NotificationService.upgrade_accepted(@debt, accepter: current_user)
    end

    redirect_to debt_path(@debt), notice: I18n.t("debts.upgrade_accepted")
  end

  def destroy
    ActiveRecord::Base.transaction do
      @debt.lock!

      @debt.update!(upgrade_recipient_id: nil)
      NotificationService.upgrade_declined(@debt, decliner: current_user)
    end

    redirect_to notifications_path, notice: I18n.t("debts.upgrade_declined")
  end

  private

  def set_debt
    @debt = Debt.includes(:lender, :borrower, :upgrade_recipient).find(params[:debt_id])
  end

  def authorize_upgrade_recipient!
    return if @debt.upgrade_recipient_id == current_user.id

    redirect_to debt_path(@debt), alert: I18n.t("debts.upgrade_not_recipient")
  end
end
