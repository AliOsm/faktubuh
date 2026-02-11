# frozen_string_literal: true

require "test_helper"

class ProfilesControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
    sign_in @user
  end

  test "show returns current user data" do
    get profile_url
    assert_response :success
  end

  test "show requires authentication" do
    sign_out @user
    get profile_url
    assert_response :redirect
  end

  test "update changes full_name" do
    patch profile_url, params: { user: { full_name: "Updated Name" } }
    assert_redirected_to profile_url
    @user.reload
    assert_equal "Updated Name", @user.full_name
  end

  test "update with blank name returns error" do
    patch profile_url, params: { user: { full_name: "" } }
    assert_redirected_to profile_url
    @user.reload
    assert_equal "Test User One", @user.full_name
  end

  test "update does not allow changing email" do
    original_email = @user.email
    patch profile_url, params: { user: { full_name: "New Name", email: "hacker@example.com" } }
    @user.reload
    assert_equal original_email, @user.email
    assert_equal "New Name", @user.full_name
  end
end
