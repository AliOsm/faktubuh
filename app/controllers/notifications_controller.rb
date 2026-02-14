# frozen_string_literal: true

class NotificationsController < InertiaController
  def index
    notifications = current_user.notifications.order(created_at: :desc)
    @pagy, paginated_notifications = pagy(notifications, limit: 25)

    render inertia: "notifications/Index", props: {
      notifications: paginated_notifications.map { |n| notification_json(n) },
      pagination: pagy_metadata(@pagy)
    }
  end

  def mark_read
    notification = current_user.notifications.find(params[:id])
    was_unread = !notification.read?
    notification.update!(read: true)

    if was_unread
      redirect_to notifications_path, notice: I18n.t("notifications_page.marked_read")
    else
      redirect_to notifications_path
    end
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
      params: notification.params || {},
      read: notification.read,
      debt_id: notification.debt_id,
      created_at: notification.created_at.iso8601
    }
  end

  def pagy_metadata(pagy)
    {
      page: pagy.page,
      last: pagy.last,
      prev: pagy.prev,
      next: pagy.next,
      pages: pagy.pages,
      count: pagy.count,
      from: pagy.from,
      to: pagy.to
    }
  end
end
