require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "user model exists with devise modules" do
    user = User.new(
      email: "test@example.com",
      password: "password123",
      full_name: "Test User",
      personal_id: "ABC234"
    )
    assert user.respond_to?(:encrypted_password)
    assert user.respond_to?(:reset_password_token)
    assert user.respond_to?(:remember_created_at)
  end

  test "user has required columns" do
    user = User.new
    assert user.respond_to?(:email)
    assert user.respond_to?(:full_name)
    assert user.respond_to?(:personal_id)
    assert user.respond_to?(:provider)
    assert user.respond_to?(:uid)
    assert user.respond_to?(:locale)
  end
end
