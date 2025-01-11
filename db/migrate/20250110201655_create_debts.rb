class CreateDebts < ActiveRecord::Migration[8.0]
  def change
    create_table :debts do |t|
      t.decimal :amount, precision: 18, scale: 2, null: false
      t.string :currency, null: false, default: "USD"
      t.string :description
      t.references :debtor, null: false, foreign_key: { to_table: :users }
      t.references :creditor, null: false, foreign_key: { to_table: :users }
      t.date :settle_date
      t.integer :status, null: false, default: 0

      t.timestamps
    end
  end
end
