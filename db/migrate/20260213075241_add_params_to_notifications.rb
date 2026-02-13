class AddParamsToNotifications < ActiveRecord::Migration[8.1]
  def change
    add_column :notifications, :params, :jsonb, default: {}
  end
end
