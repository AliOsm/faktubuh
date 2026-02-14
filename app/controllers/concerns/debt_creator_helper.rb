# frozen_string_literal: true

module DebtCreatorHelper
  extend ActiveSupport::Concern

  private

  def creator_user(debt)
    # For personal debts, lender_id is always the creator (database constraint)
    # For mutual debts, check creator_role to determine creator
    if debt.personal?
      debt.lender
    else
      debt.creator_role_lender? ? debt.lender : debt.borrower
    end
  end
end
