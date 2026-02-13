class ConfirmExistingUsers < ActiveRecord::Migration[8.1]
  def change
    User.update_all(confirmed_at: Time.current)
  end
end
