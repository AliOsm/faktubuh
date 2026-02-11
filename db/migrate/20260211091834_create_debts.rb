class CreateDebts < ActiveRecord::Migration[8.1]
  def change
    create_enum :debt_mode, %w[mutual personal]
    create_enum :debt_creator_role, %w[lender borrower]
    create_enum :debt_installment_type, %w[lump_sum monthly bi_weekly quarterly yearly custom_split]
    create_enum :debt_status, %w[pending active settled rejected]

    create_table :debts do |t|
      t.references :lender, null: false, foreign_key: { to_table: :users }
      t.references :borrower, foreign_key: { to_table: :users }
      t.string :counterparty_name
      t.enum :mode, enum_type: :debt_mode, null: false
      t.enum :creator_role, enum_type: :debt_creator_role, null: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :currency, limit: 3, null: false
      t.text :description
      t.date :deadline, null: false
      t.enum :installment_type, enum_type: :debt_installment_type, null: false
      t.enum :status, enum_type: :debt_status, null: false, default: "pending"

      t.timestamps
    end

    add_index :debts, :status
    add_index :debts, %i[lender_id status]
    add_index :debts, %i[borrower_id status]
  end
end
