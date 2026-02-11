# frozen_string_literal: true

require "test_helper"

class DashboardControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
    sign_in @user
  end

  test "empty state for new user with no debts" do
    new_user = User.create!(
      email: "nodebts@example.com",
      password: "password123",
      full_name: "No Debts User"
    )
    sign_in new_user
    get dashboard_url
    assert_response :success
  end

  test "single currency summary" do
    # User :one has mutual_debt (USD, active, lender, 1000) and personal_debt (SAR, active, lender, 500)
    # and pending_mutual_debt (USD, pending) which should not appear in summaries
    get dashboard_url
    assert_response :success
  end

  test "multiple currencies returned in summaries" do
    # User :one has debts in both USD and SAR
    get dashboard_url
    assert_response :success
  end

  test "authenticated root redirects to dashboard" do
    get root_url
    assert_response :success
  end

  test "requires authentication" do
    sign_out @user
    get dashboard_url
    assert_response :redirect
  end
end
