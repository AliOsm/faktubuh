class CreateWitnesses < ActiveRecord::Migration[8.1]
  def change
    create_enum :witness_status, %w[invited confirmed declined]

    create_table :witnesses do |t|
      t.references :debt, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.enum :status, enum_type: :witness_status, default: "invited", null: false
      t.datetime :confirmed_at
      t.timestamps
    end

    add_index :witnesses, %i[debt_id user_id], unique: true
  end
end
