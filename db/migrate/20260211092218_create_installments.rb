class CreateInstallments < ActiveRecord::Migration[8.1]
  def change
    create_enum :installment_status, %w[upcoming submitted approved rejected overdue]

    create_table :installments do |t|
      t.references :debt, null: false, foreign_key: true
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :description
      t.date :due_date, null: false
      t.enum :status, enum_type: :installment_status, default: "upcoming", null: false
      t.timestamps
    end

    add_index :installments, %i[debt_id due_date]
  end
end
