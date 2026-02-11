class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :debt, optional: true

  scope :unread, -> { where(read: false) }

  validates :notification_type, presence: true
  validates :message, presence: true
end
