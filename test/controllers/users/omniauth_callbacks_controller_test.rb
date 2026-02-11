# frozen_string_literal: true

require "test_helper"

class Users::OmniauthCallbacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    OmniAuth.config.test_mode = true
  end

  teardown do
    OmniAuth.config.test_mode = false
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end

  test "OAuth callback with new user creates account and signs in" do
    mock_google_oauth2(email: "newuser@example.com", name: "New OAuth User")

    assert_difference "User.count", 1 do
      post user_google_oauth2_omniauth_callback_url
    end

    user = User.find_by(email: "newuser@example.com")
    assert_not_nil user
    assert_equal "New OAuth User", user.full_name
    assert_equal "google_oauth2", user.provider
    assert_equal "123456", user.uid
    assert_match(/\A[A-HJ-KM-NP-Z2-9]{6}\z/, user.personal_id)

    assert_redirected_to root_path
  end

  test "OAuth callback with existing user signs in without creating new account" do
    existing_user = users(:one)
    existing_user.update!(provider: "google_oauth2", uid: "existing-uid-123")

    mock_google_oauth2(email: existing_user.email, name: existing_user.full_name, uid: "existing-uid-123")

    assert_no_difference "User.count" do
      post user_google_oauth2_omniauth_callback_url
    end

    assert_redirected_to root_path
  end

  test "OAuth callback with existing email links OAuth to existing account" do
    existing_user = users(:one)
    assert_nil existing_user.provider

    mock_google_oauth2(email: existing_user.email, name: existing_user.full_name, uid: "new-oauth-uid")

    assert_no_difference "User.count" do
      post user_google_oauth2_omniauth_callback_url
    end

    existing_user.reload
    assert_equal "google_oauth2", existing_user.provider
    assert_equal "new-oauth-uid", existing_user.uid

    assert_redirected_to root_path
  end

  test "OAuth failure redirects to sign in with error" do
    OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials

    # OmniAuth failure → Devise failure app → redirects to sign-in
    post user_google_oauth2_omniauth_callback_url

    # Devise failure app redirects to sign-in via our custom InertiaFailureApp
    assert_response :redirect
  end

  private

  def mock_google_oauth2(email:, name:, uid: "123456")
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: uid,
      info: OmniAuth::AuthHash::InfoHash.new(
        email: email,
        name: name
      )
    )
  end
end
