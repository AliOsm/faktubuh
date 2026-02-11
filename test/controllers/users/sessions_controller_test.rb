require "test_helper"

class Users::SessionsControllerTest < ActionDispatch::IntegrationTest
  test "sign in page renders successfully" do
    get new_user_session_url
    assert_response :success
  end

  test "successful login redirects to root" do
    user = users(:one)

    post user_session_url, params: {
      user: {
        email: user.email,
        password: "password123"
      }
    }

    assert_redirected_to root_path
    follow_redirect!
    assert_response :success
  end

  test "invalid credentials show error" do
    post user_session_url, params: {
      user: {
        email: "nonexistent@example.com",
        password: "wrongpassword"
      }
    }

    # Devise returns unprocessable_content for invalid credentials
    assert_response :unprocessable_content
  end

  test "logout clears session and redirects to sign in" do
    user = users(:one)

    # Sign in first
    post user_session_url, params: {
      user: {
        email: user.email,
        password: "password123"
      }
    }
    assert_redirected_to root_path

    # Sign out
    delete destroy_user_session_url
    assert_redirected_to new_user_session_path
  end

  test "unauthenticated user sees sign in page at root" do
    # devise_scope unauthenticated root renders sessions#new directly
    get root_url
    assert_response :success
  end
end
