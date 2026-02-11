# frozen_string_literal: true

class NotificationsController < InertiaController
  def index
    notifications = current_user.notifications.order(created_at: :desc)

    render inertia: "notifications/Index", props: {
      notifications: notifications.map { |n| notification_json(n) }
    }
  end

  def mark_read
    notification = current_user.notifications.find(params[:id])
    notification.update!(read: true)

    redirect_to notifications_path, notice: I18n.t("notifications_page.marked_read")
  end

  def mark_all_read
    current_user.notifications.unread.update_all(read: true) # rubocop:disable Rails/SkipsModelValidations

    redirect_to notifications_path, notice: I18n.t("notifications_page.all_marked_read")
  end

  private

  def notification_json(notification)
    {
      id: notification.id,
      notification_type: notification.notification_type,
      message: notification.message,
      read: notification.read,
      debt_id: notification.debt_id,
      created_at: notification.created_at.iso8601
    }
  end
end
