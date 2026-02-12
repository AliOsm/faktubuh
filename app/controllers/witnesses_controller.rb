# frozen_string_literal: true

class WitnessesController < InertiaController
  before_action :set_debt
  before_action :set_witness, only: %i[confirm decline]
  before_action :authorize_witness_creation!, only: :create
  before_action :authorize_witness_action!, only: %i[confirm decline]

  def create
    personal_id = params[:witness][:personal_id]&.upcase&.strip
    user = User.find_by(personal_id: personal_id)

    unless user
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.user_not_found")
      return
    end

    if user.id == current_user.id
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.cannot_invite_self")
      return
    end

    if @debt.witnesses.exists?(user_id: user.id)
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.already_invited")
      return
    end

    if [ @debt.lender_id, @debt.borrower_id ].include?(user.id)
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.cannot_invite_party")
      return
    end

    if @debt.witnesses.count >= 2
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.max_witnesses")
      return
    end

    witness = @debt.witnesses.create!(user: user, status: "invited")
    NotificationService.witness_invited(witness)

    redirect_to debt_path(@debt), notice: I18n.t("witnesses.invited")
  end

  def confirm
    @witness.update!(status: "confirmed", confirmed_at: Time.current)
    NotificationService.witness_confirmed(@witness)

    redirect_to debt_path(@debt), notice: I18n.t("witnesses.confirmed")
  end

  def decline
    @witness.update!(status: "declined")
    NotificationService.witness_declined(@witness)

    redirect_to debt_path(@debt), notice: I18n.t("witnesses.declined")
  end

  private

  def set_debt
    @debt = Debt.find(params[:debt_id])
  end

  def set_witness
    @witness = @debt.witnesses.find(params[:id])
  end

  def authorize_witness_creation!
    unless creator_user(@debt)&.id == current_user.id
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.not_creator")
      return
    end

    if @debt.settled? || @debt.rejected?
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.debt_not_eligible")
      nil
    end
  end

  def authorize_witness_action!
    unless @witness.user_id == current_user.id
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.not_invited_witness")
      return
    end

    unless @witness.invited?
      redirect_to debt_path(@debt), alert: I18n.t("witnesses.already_responded")
      nil
    end
  end

  def creator_user(debt)
    debt.creator_role_lender? ? debt.lender : debt.borrower
  end
end
