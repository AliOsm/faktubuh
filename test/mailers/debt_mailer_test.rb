# frozen_string_literal: true

require "test_helper"

class DebtMailerTest < ActionMailer::TestCase
  setup do
    @lender = users(:one)   # locale: en
    @borrower = users(:two) # locale: ar
    @mutual_debt = debts(:mutual_debt)
    @personal_debt = debts(:personal_debt)
    @pending_payment = payments(:pending_payment)
    @approved_payment = payments(:approved_payment)
    @invited_witness = witnesses(:invited_witness)
  end

  test "debt_created renders correct content for recipient" do
    email = DebtMailer.debt_created(@mutual_debt, @lender)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ @lender.email ], email.to
    assert_includes email.subject, @mutual_debt.amount.to_s
    assert_includes email.subject, @mutual_debt.currency
    body = decoded_body(email)
    assert_match @lender.full_name, body
    assert_match @mutual_debt.amount.to_s, body
    assert_match @mutual_debt.currency, body
  end

  test "debt_confirmed renders correct content" do
    email = DebtMailer.debt_confirmed(@mutual_debt, @lender)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ @lender.email ], email.to
    assert_includes email.subject, @mutual_debt.amount.to_s
    body = decoded_body(email)
    assert_match @lender.full_name, body
    assert_match @mutual_debt.amount.to_s, body
  end

  test "payment_submitted renders correct content" do
    email = DebtMailer.payment_submitted(@pending_payment, @lender)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ @lender.email ], email.to
    assert_includes email.subject, @pending_payment.amount.to_s
    body = decoded_body(email)
    assert_match @lender.full_name, body
    assert_match @borrower.full_name, body
    assert_match @pending_payment.amount.to_s, body
  end

  test "payment_approved renders correct content" do
    email = DebtMailer.payment_approved(@pending_payment, @lender)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ @lender.email ], email.to
    assert_includes email.subject, @pending_payment.amount.to_s
    body = decoded_body(email)
    assert_match @lender.full_name, body
    assert_match @pending_payment.amount.to_s, body
  end

  test "payment_rejected renders correct content" do
    @pending_payment.update!(status: :rejected, rejection_reason: "Invalid receipt")
    email = DebtMailer.payment_rejected(@pending_payment, @lender)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ @lender.email ], email.to
    assert_includes email.subject, @pending_payment.amount.to_s
    body = decoded_body(email)
    assert_match @lender.full_name, body
    assert_match "Invalid receipt", body
  end

  test "witness_invitation renders correct content" do
    # invited_witness user is @borrower (locale: ar), so send to an English user instead
    witness = witnesses(:confirmed_witness) # user: three (locale: en)
    email = DebtMailer.witness_invitation(witness)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ witness.user.email ], email.to
    body = decoded_body(email)
    assert_match witness.user.full_name, body
    assert_match witness.debt.amount.to_s, body
  end

  test "debt_settled renders correct content" do
    email = DebtMailer.debt_settled(@mutual_debt, @lender)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ @lender.email ], email.to
    assert_includes email.subject, @mutual_debt.amount.to_s
    body = decoded_body(email)
    assert_match @lender.full_name, body
    assert_match @mutual_debt.amount.to_s, body
  end

  test "email sent to correct recipient" do
    email = DebtMailer.debt_created(@mutual_debt, @lender)
    assert_equal [ @lender.email ], email.to

    email2 = DebtMailer.debt_settled(@mutual_debt, @borrower)
    assert_equal [ @borrower.email ], email2.to
  end

  test "email uses recipient locale for Arabic user" do
    assert_equal "ar", @borrower.locale

    email = DebtMailer.debt_created(@mutual_debt, @borrower)

    assert_includes email.subject, @mutual_debt.amount.to_s
    body = decoded_body(email)
    assert_match(/مرحب/, body)
  end

  test "email uses recipient locale for English user" do
    assert_equal "en", @lender.locale

    email = DebtMailer.debt_created(@mutual_debt, @lender)

    body = decoded_body(email)
    assert_match "Hello", body
  end

  test "personal debt email uses counterparty_name" do
    email = DebtMailer.debt_settled(@personal_debt, @lender)

    assert_equal [ @lender.email ], email.to
    body = decoded_body(email)
    assert_match "Ahmed Hassan", body
  end

  private

  def decoded_body(email)
    if email.multipart?
      email.text_part.body.decoded
    else
      email.body.decoded
    end
  end
end
