require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    I18n.locale = :en
  end

  teardown do
    I18n.locale = I18n.default_locale
  end

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
  test "personal_id accepts valid formats of 3-12 uppercase alphanumeric" do
    user = User.new(
      email: "format@example.com",
      password: "password123",
      full_name: "Format Test"
    )

    # Valid: 6 chars (original length)
    user.personal_id = "XYZ789"
    user.valid?
    assert_empty user.errors[:personal_id]

    # Valid: 3 chars (minimum)
    user.personal_id = "VW2"
    user.valid?
    assert_empty user.errors[:personal_id]

    # Valid: 12 chars (maximum)
    user.personal_id = "VWXYZ2345678"
    user.valid?
    assert_empty user.errors[:personal_id]

    # Valid: contains O, I, L (allowed in user-defined IDs)
    user.personal_id = "OIL239"
    user.valid?
    assert_empty user.errors[:personal_id]

    # Valid: contains 0 and 1 (allowed in user-defined IDs)
    user.personal_id = "ABC01X"
    user.valid?
    assert_empty user.errors[:personal_id]
  end

  test "personal_id rejects invalid formats" do
    user = User.new(
      email: "format2@example.com",
      password: "password123",
      full_name: "Format Test"
    )

    # Invalid: 2 chars (below minimum)
    user.personal_id = "AB"
    assert_not user.valid?
    assert_not_empty user.errors[:personal_id]

    # Invalid: 13 chars (above maximum)
    user.personal_id = "ABCDEFGH23456"
    assert_not user.valid?
    assert_not_empty user.errors[:personal_id]

    # Invalid: contains special characters
    user.personal_id = "ABC-23"
    assert_not user.valid?
    assert_not_empty user.errors[:personal_id]
  end

  # normalize_personal_id callback
  test "personal_id is normalized to uppercase and stripped" do
    user = User.new(
      email: "norm@example.com",
      password: "password123",
      full_name: "Norm Test",
      personal_id: "  abc234  "
    )
    user.valid?
    assert_equal "ABC234", user.personal_id
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

  # personal_id excludes ambiguous characters in auto-generation
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
