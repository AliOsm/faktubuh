# frozen_string_literal: true

require "test_helper"

class WitnessesControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @lender = users(:one)
    @borrower = users(:two)
    @witness_user = users(:three)
    @fourth_user = users(:four)
    @mutual_debt = debts(:mutual_debt)
    @personal_debt = debts(:personal_debt)
  end

  # --- create action tests ---

  test "invite witness successfully" do
    sign_in @lender

    assert_difference [ "Witness.count", "Notification.count" ], 1 do
      post debt_witnesses_url(@mutual_debt), params: {
        witness: { personal_id: @fourth_user.personal_id }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
    witness = Witness.last
    assert_equal @fourth_user.id, witness.user_id
    assert_equal @mutual_debt.id, witness.debt_id
    assert_equal "invited", witness.status

    notification = Notification.last
    assert_equal @fourth_user.id, notification.user_id
    assert_equal "witness_invited", notification.notification_type
    assert_equal @mutual_debt.id, notification.debt_id
  end

  test "max 2 witnesses enforced" do
    sign_in @lender

    # mutual_debt already has invited_witness (user three). Add another:
    @mutual_debt.witnesses.create!(user: @fourth_user, status: "confirmed")

    assert_no_difference "Witness.count" do
      post debt_witnesses_url(@mutual_debt), params: {
        witness: { personal_id: users(:five).personal_id }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end

  test "duplicate invitation prevented" do
    sign_in @lender

    # invited_witness fixture already exists for user three on mutual_debt
    assert_no_difference "Witness.count" do
      post debt_witnesses_url(@mutual_debt), params: {
        witness: { personal_id: @witness_user.personal_id }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end

  test "cannot invite borrower as witness" do
    sign_in @lender

    assert_no_difference "Witness.count" do
      post debt_witnesses_url(@mutual_debt), params: {
        witness: { personal_id: @borrower.personal_id }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end


  test "cannot invite self as witness" do
    sign_in @lender

    assert_no_difference "Witness.count" do
      post debt_witnesses_url(@mutual_debt), params: {
        witness: { personal_id: @lender.personal_id }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end

  test "non-creator cannot invite witnesses" do
    sign_in @borrower

    assert_no_difference "Witness.count" do
      post debt_witnesses_url(@mutual_debt), params: {
        witness: { personal_id: @fourth_user.personal_id }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end

  # --- confirm action tests ---

  test "witness confirms invitation" do
    sign_in @witness_user
    invited_witness = witnesses(:invited_witness)

    assert_difference "Notification.count", 1 do
      post confirm_debt_witness_url(@mutual_debt, invited_witness)
    end

    assert_redirected_to debt_path(@mutual_debt)
    invited_witness.reload
    assert_equal "confirmed", invited_witness.status
    assert_not_nil invited_witness.confirmed_at

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "witness_confirmed", notification.notification_type
  end

  # --- decline action tests ---

  test "witness declines invitation" do
    sign_in @witness_user
    invited_witness = witnesses(:invited_witness)

    assert_difference "Notification.count", 1 do
      post decline_debt_witness_url(@mutual_debt, invited_witness)
    end

    assert_redirected_to debt_path(@mutual_debt)
    invited_witness.reload
    assert_equal "declined", invited_witness.status

    notification = Notification.last
    assert_equal @lender.id, notification.user_id
    assert_equal "witness_declined", notification.notification_type
  end

  test "non-invited user cannot confirm witness" do
    sign_in @fourth_user
    invited_witness = witnesses(:invited_witness)

    post confirm_debt_witness_url(@mutual_debt, invited_witness)

    assert_redirected_to debt_path(@mutual_debt)
    invited_witness.reload
    assert_equal "invited", invited_witness.status
  end

  test "already confirmed witness cannot confirm again" do
    sign_in @witness_user
    confirmed_witness = witnesses(:confirmed_witness)

    post confirm_debt_witness_url(@personal_debt, confirmed_witness)

    assert_redirected_to debt_path(@personal_debt)
  end

  # --- US-033: cannot add witness to settled debt ---

  test "cannot add witness to settled debt" do
    sign_in @lender
    @mutual_debt.update!(status: "settled")

    assert_no_difference "Witness.count" do
      post debt_witnesses_url(@mutual_debt), params: {
        witness: { personal_id: @fourth_user.personal_id }
      }
    end

    assert_redirected_to debt_path(@mutual_debt)
  end
end
