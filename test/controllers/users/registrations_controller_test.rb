require "test_helper"

class Users::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "sign up page renders successfully" do
    get new_user_registration_url
    assert_response :success
  end

  test "successful registration creates user with personal id" do
    assert_difference "User.count", 1 do
      post user_registration_url, params: {
        user: {
          full_name: "New User",
          email: "newuser@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    user = User.find_by(email: "newuser@example.com")
    assert_not_nil user
    assert_equal "New User", user.full_name
    assert_match(/\A[A-HJ-KM-NP-Z2-9]{6}\z/, user.personal_id)
    assert_redirected_to root_path
  end

  test "successful registration signs user in" do
    post user_registration_url, params: {
      user: {
        full_name: "Sign In User",
        email: "signin@example.com",
        password: "password123",
        password_confirmation: "password123"
      }
    }

    follow_redirect!
    assert_response :success
  end

  test "registration with missing full name returns errors" do
    assert_no_difference "User.count" do
      post user_registration_url, params: {
        user: {
          full_name: "",
          email: "noname@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    assert_redirected_to new_user_registration_path
  end

  test "registration with duplicate email returns errors" do
    existing = users(:one)

    assert_no_difference "User.count" do
      post user_registration_url, params: {
        user: {
          full_name: "Duplicate Email",
          email: existing.email,
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    assert_redirected_to new_user_registration_path
  end

  test "registration with password mismatch returns errors" do
    assert_no_difference "User.count" do
      post user_registration_url, params: {
        user: {
          full_name: "Mismatch User",
          email: "mismatch@example.com",
          password: "password123",
          password_confirmation: "different456"
        }
      }
    end

    assert_redirected_to new_user_registration_path
  end

  test "registration with short password returns errors" do
    assert_no_difference "User.count" do
      post user_registration_url, params: {
        user: {
          full_name: "Short Pass",
          email: "shortpass@example.com",
          password: "12345",
          password_confirmation: "12345"
        }
      }
    end

    assert_redirected_to new_user_registration_path
  end
end
