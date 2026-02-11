require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "home page renders successfully" do
    get root_url
    assert_response :success
  end

  test "locale defaults to english" do
    get root_url
    assert_response :success
  end

  test "locale can be set via params" do
    get root_url, params: { locale: "ar" }
    assert_response :success
  end

  test "invalid locale falls back to default" do
    get root_url, params: { locale: "xx" }
    assert_response :success
  end
end
