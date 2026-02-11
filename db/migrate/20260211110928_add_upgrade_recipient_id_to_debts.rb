class AddUpgradeRecipientIdToDebts < ActiveRecord::Migration[8.1]
  def change
    add_column :debts, :upgrade_recipient_id, :bigint
    add_foreign_key :debts, :users, column: :upgrade_recipient_id
  end
end
