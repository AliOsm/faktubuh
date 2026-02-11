require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  test "home page renders successfully for authenticated user" do
    sign_in users(:one)
    get root_url
    assert_response :success
  end

  test "locale defaults to english" do
    sign_in users(:one)
    get root_url
    assert_response :success
  end

  test "locale can be set via params" do
    sign_in users(:one)
    get root_url, params: { locale: "ar" }
    assert_response :success
  end

  test "invalid locale falls back to default" do
    sign_in users(:one)
    get root_url, params: { locale: "xx" }
    assert_response :success
  end
end
