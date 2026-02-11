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

  # full_name presence validation
  test "full_name must be present" do
    user = User.new(
      email: "test@example.com",
      password: "password123",
      personal_id: "ABC234"
    )
    assert_not user.valid?
    assert_includes user.errors[:full_name], "can't be blank"
  end

  # personal_id format validation
  test "personal_id must match format of 6 uppercase alphanumeric excluding ambiguous chars" do
    user = User.new(
      email: "format@example.com",
      password: "password123",
      full_name: "Format Test"
    )

    # Valid format
    user.personal_id = "XYZ789"
    user.valid?
    assert_empty user.errors[:personal_id]

    # Invalid: contains O (ambiguous)
    user.personal_id = "ABCDO2"
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "is invalid"

    # Invalid: contains 0 (ambiguous)
    user.personal_id = "ABCD02"
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "is invalid"

    # Invalid: contains 1 (ambiguous)
    user.personal_id = "ABCD12"
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "is invalid"

    # Invalid: contains I (ambiguous)
    user.personal_id = "ABCDI2"
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "is invalid"

    # Invalid: contains L (ambiguous)
    user.personal_id = "ABCDL2"
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "is invalid"

    # Invalid: lowercase
    user.personal_id = "abc234"
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "is invalid"

    # Invalid: too short
    user.personal_id = "ABC23"
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "is invalid"
  end

  # personal_id uniqueness
  test "personal_id must be unique" do
    existing = users(:one)
    user = User.new(
      email: "unique@example.com",
      password: "password123",
      full_name: "Unique Test",
      personal_id: existing.personal_id
    )
    assert_not user.valid?
    assert_includes user.errors[:personal_id], "has already been taken"
  end

  # personal_id auto-generation on create
  test "personal_id is auto-generated when blank on create" do
    user = User.create!(
      email: "autogen@example.com",
      password: "password123",
      full_name: "Auto Gen"
    )
    assert_not_nil user.personal_id
    assert_match(/\A[A-HJ-NP-Z2-9]{6}\z/, user.personal_id)
  end

  # personal_id excludes ambiguous characters
  test "auto-generated personal_id excludes ambiguous characters 0 O 1 I L" do
    10.times do
      user = User.create!(
        email: "ambig#{SecureRandom.hex(4)}@example.com",
        password: "password123",
        full_name: "Ambig Test"
      )
      refute_match(/[01OIL]/, user.personal_id,
        "Personal ID #{user.personal_id} contains ambiguous characters")
    end
  end

  # from_omniauth creates new user
  test "from_omniauth creates new user when none exists" do
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "12345",
      info: OmniAuth::AuthHash::InfoHash.new(
        email: "oauth_new@example.com",
        name: "OAuth New User"
      )
    )

    assert_difference "User.count", 1 do
      user = User.from_omniauth(auth)
      assert_equal "oauth_new@example.com", user.email
      assert_equal "OAuth New User", user.full_name
      assert_equal "google_oauth2", user.provider
      assert_equal "12345", user.uid
      assert user.persisted?
      assert_match(/\A[A-HJ-NP-Z2-9]{6}\z/, user.personal_id)
    end
  end

  # from_omniauth finds existing user by provider+uid
  test "from_omniauth finds existing user by provider and uid" do
    existing = User.create!(
      email: "existing_oauth@example.com",
      password: "password123",
      full_name: "Existing OAuth",
      provider: "google_oauth2",
      uid: "99999"
    )

    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "99999",
      info: OmniAuth::AuthHash::InfoHash.new(
        email: "existing_oauth@example.com",
        name: "Existing OAuth"
      )
    )

    assert_no_difference "User.count" do
      user = User.from_omniauth(auth)
      assert_equal existing.id, user.id
    end
  end

  # from_omniauth links existing user by email
  test "from_omniauth links existing user by email when provider and uid not set" do
    existing = User.create!(
      email: "link_email@example.com",
      password: "password123",
      full_name: "Link Email"
    )

    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "88888",
      info: OmniAuth::AuthHash::InfoHash.new(
        email: "link_email@example.com",
        name: "Link Email"
      )
    )

    assert_no_difference "User.count" do
      user = User.from_omniauth(auth)
      assert_equal existing.id, user.id
      assert_equal "google_oauth2", user.reload.provider
      assert_equal "88888", user.uid
    end
  end
end
