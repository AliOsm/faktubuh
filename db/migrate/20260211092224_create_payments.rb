class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_enum :payment_status, %w[pending approved rejected]

    create_table :payments do |t|
      t.references :debt, null: false, foreign_key: true
      t.references :installment, null: true, foreign_key: true
      t.references :submitter, null: false, foreign_key: { to_table: :users }
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :description
      t.datetime :submitted_at, null: false
      t.enum :status, enum_type: :payment_status, default: "pending", null: false
      t.text :rejection_reason
      t.timestamps
    end

    add_index :payments, %i[debt_id status]
  end
end
