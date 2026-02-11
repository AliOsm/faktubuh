# frozen_string_literal: true

require "test_helper"

class NotificationsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
    sign_in @user
  end

  test "index returns user's notifications" do
    get notifications_url
    assert_response :success
  end

  test "mark single notification as read" do
    notification = notifications(:unread_notification)
    assert_not notification.read

    post mark_read_notification_url(notification)

    notification.reload
    assert notification.read
    assert_redirected_to notifications_path
  end

  test "mark all as read" do
    assert @user.notifications.unread.count > 0

    post mark_all_read_notifications_url

    assert_equal 0, @user.notifications.unread.count
    assert_redirected_to notifications_path
  end

  test "requires authentication" do
    sign_out @user
    get notifications_url
    assert_response :redirect
  end
end
