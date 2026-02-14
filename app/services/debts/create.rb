# frozen_string_literal: true

class Debts::Create
  Result = Struct.new(:success?, :debt, :errors, keyword_init: true)

  def initialize(params:, creator_role:, counterparty_personal_id:, current_user:)
    @params = params
    @creator_role = creator_role
    @counterparty_personal_id = counterparty_personal_id&.upcase&.strip
    @current_user = current_user
  end

  def call
    debt = Debt.new(@params)
    debt.creator_role = @creator_role

    if debt.mutual?
      return error_result(debt) unless assign_mutual_parties(debt)
    else
      debt.lender = @current_user
    end

    debt.status = debt.mutual? ? "pending" : "active"

    if debt.save
      after_create(debt)
      Result.new(success?: true, debt:)
    else
      error_result(debt)
    end
  end

  private

  def assign_mutual_parties(debt)
    counterparty = User.find_by(personal_id: @counterparty_personal_id)

    unless counterparty
      debt.errors.add(:counterparty_personal_id, "not found")
      return false
    end

    if counterparty.id == @current_user.id
      debt.errors.add(:counterparty_personal_id, "cannot create a debt with yourself")
      return false
    end

    if debt.creator_role_lender?
      debt.lender = @current_user
      debt.borrower = counterparty
    else
      debt.borrower = @current_user
      debt.lender = counterparty
    end

    true
  end

  def after_create(debt)
    if debt.personal?
      InstallmentScheduleGenerator.new(debt).generate!
    elsif debt.mutual?
      NotificationService.debt_created(debt)
    end
  end

  def error_result(debt) = Result.new(success?: false, errors: debt.errors.to_hash(true))
end
