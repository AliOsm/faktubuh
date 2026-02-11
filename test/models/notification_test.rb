require "test_helper"

class NotificationTest < ActiveSupport::TestCase
  # === Associations ===

  test "belongs to user" do
    notification = notifications(:unread_notification)
    assert_equal users(:one), notification.user
  end

  test "belongs to debt optionally" do
    notification = notifications(:unread_notification)
    assert_equal debts(:mutual_debt), notification.debt
  end

  test "debt can be nil" do
    notification = Notification.new(
      user: users(:one),
      notification_type: "system",
      message: "Welcome to Faktubuh"
    )
    assert notification.valid?
    assert_nil notification.debt
  end

  # === Validations ===

  test "valid notification" do
    notification = Notification.new(
      user: users(:one),
      notification_type: "debt_created",
      message: "A new debt has been created",
      debt: debts(:mutual_debt)
    )
    assert notification.valid?
  end

  test "notification_type is required" do
    notification = Notification.new(
      user: users(:one),
      notification_type: "",
      message: "A new debt has been created"
    )
    assert_not notification.valid?
    assert_includes notification.errors[:notification_type], "can't be blank"
  end

  test "message is required" do
    notification = Notification.new(
      user: users(:one),
      notification_type: "debt_created",
      message: ""
    )
    assert_not notification.valid?
    assert_includes notification.errors[:message], "can't be blank"
  end

  # === Scopes ===

  test "unread scope returns only unread notifications" do
    unread = Notification.unread.where(user: users(:one))
    assert_includes unread, notifications(:unread_notification)
    assert_not_includes unread, notifications(:read_notification)
  end

  test "default read is false" do
    notification = Notification.new
    assert_equal false, notification.read
  end
end
