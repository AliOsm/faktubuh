class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :notification_type, null: false
      t.text :message, null: false
      t.boolean :read, default: false, null: false
      t.references :debt, null: true, foreign_key: true
      t.timestamps
    end

    add_index :notifications, %i[user_id read]
  end
end
