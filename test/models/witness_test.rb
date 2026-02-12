require "test_helper"

class WitnessTest < ActiveSupport::TestCase
  # === Associations ===

  test "belongs to debt" do
    witness = witnesses(:invited_witness)
    assert_equal debts(:mutual_debt), witness.debt
  end

  test "belongs to user" do
    witness = witnesses(:invited_witness)
    assert_equal users(:three), witness.user
  end

  # === Validations ===

  test "valid witness" do
    witness = Witness.new(
      debt: debts(:personal_debt),
      user: users(:two)
    )
    assert witness.valid?
  end

  test "user_id uniqueness scoped to debt_id" do
    witness = Witness.new(
      debt: debts(:mutual_debt),
      user: users(:three)
    )
    assert_not witness.valid?
    assert_includes witness.errors[:user_id], "has already been taken"
  end

  test "debt party cannot be witness" do
    witness = Witness.new(
      debt: debts(:mutual_debt),
      user: users(:two)
    )
    assert_not witness.valid?
    assert_includes witness.errors[:user_id], "cannot be a party to the debt"
  end

  test "same user can witness different debts" do
    witness = Witness.new(
      debt: debts(:personal_debt),
      user: users(:two)
    )
    assert witness.valid?
  end

  # === Enums ===

  test "status enum values" do
    expected = {
      "invited" => "invited",
      "confirmed" => "confirmed",
      "declined" => "declined"
    }
    assert_equal expected, Witness.statuses
  end

  test "default status is invited" do
    witness = Witness.new
    assert_equal "invited", witness.status
  end

  test "status query methods work" do
    witness = witnesses(:invited_witness)
    assert witness.invited?
    assert_not witness.confirmed?
    assert_not witness.declined?
  end
end
