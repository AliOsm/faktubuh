# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_13_075241) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "debt_creator_role", ["lender", "borrower"]
  create_enum "debt_installment_type", ["lump_sum", "monthly", "bi_weekly", "quarterly", "yearly", "custom_split"]
  create_enum "debt_mode", ["mutual", "personal"]
  create_enum "debt_status", ["pending", "active", "settled", "rejected"]
  create_enum "installment_status", ["upcoming", "submitted", "approved", "rejected", "overdue"]
  create_enum "payment_status", ["pending", "approved", "rejected"]
  create_enum "witness_status", ["invited", "confirmed", "declined"]

  create_table "debts", force: :cascade do |t|
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.bigint "borrower_id"
    t.string "counterparty_name"
    t.datetime "created_at", null: false
    t.enum "creator_role", null: false, enum_type: "debt_creator_role"
    t.string "currency", limit: 3, null: false
    t.date "deadline", null: false
    t.text "description"
    t.enum "installment_type", null: false, enum_type: "debt_installment_type"
    t.bigint "lender_id", null: false
    t.enum "mode", null: false, enum_type: "debt_mode"
    t.enum "status", default: "pending", null: false, enum_type: "debt_status"
    t.datetime "updated_at", null: false
    t.bigint "upgrade_recipient_id"
    t.index ["borrower_id", "status"], name: "index_debts_on_borrower_id_and_status"
    t.index ["borrower_id"], name: "index_debts_on_borrower_id"
    t.index ["lender_id", "status"], name: "index_debts_on_lender_id_and_status"
    t.index ["lender_id"], name: "index_debts_on_lender_id"
    t.index ["status"], name: "index_debts_on_status"
  end

  create_table "good_job_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "callback_priority"
    t.text "callback_queue_name"
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "discarded_at"
    t.datetime "enqueued_at"
    t.datetime "finished_at"
    t.datetime "jobs_finished_at"
    t.text "on_discard"
    t.text "on_finish"
    t.text "on_success"
    t.jsonb "serialized_properties"
    t.datetime "updated_at", null: false
  end

  create_table "good_job_executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "active_job_id", null: false
    t.datetime "created_at", null: false
    t.interval "duration"
    t.text "error"
    t.text "error_backtrace", array: true
    t.integer "error_event", limit: 2
    t.datetime "finished_at"
    t.text "job_class"
    t.uuid "process_id"
    t.text "queue_name"
    t.datetime "scheduled_at"
    t.jsonb "serialized_params"
    t.datetime "updated_at", null: false
    t.index ["active_job_id", "created_at"], name: "index_good_job_executions_on_active_job_id_and_created_at"
    t.index ["process_id", "created_at"], name: "index_good_job_executions_on_process_id_and_created_at"
  end

  create_table "good_job_processes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "lock_type", limit: 2
    t.jsonb "state"
    t.datetime "updated_at", null: false
  end

  create_table "good_job_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "key"
    t.datetime "updated_at", null: false
    t.jsonb "value"
    t.index ["key"], name: "index_good_job_settings_on_key", unique: true
  end

  create_table "good_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "active_job_id"
    t.uuid "batch_callback_id"
    t.uuid "batch_id"
    t.text "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "cron_at"
    t.text "cron_key"
    t.text "error"
    t.integer "error_event", limit: 2
    t.integer "executions_count"
    t.datetime "finished_at"
    t.boolean "is_discrete"
    t.text "job_class"
    t.text "labels", array: true
    t.datetime "locked_at"
    t.uuid "locked_by_id"
    t.datetime "performed_at"
    t.integer "priority"
    t.text "queue_name"
    t.uuid "retried_good_job_id"
    t.datetime "scheduled_at"
    t.jsonb "serialized_params"
    t.datetime "updated_at", null: false
    t.index ["active_job_id", "created_at"], name: "index_good_jobs_on_active_job_id_and_created_at"
    t.index ["batch_callback_id"], name: "index_good_jobs_on_batch_callback_id", where: "(batch_callback_id IS NOT NULL)"
    t.index ["batch_id"], name: "index_good_jobs_on_batch_id", where: "(batch_id IS NOT NULL)"
    t.index ["concurrency_key", "created_at"], name: "index_good_jobs_on_concurrency_key_and_created_at"
    t.index ["concurrency_key"], name: "index_good_jobs_on_concurrency_key_when_unfinished", where: "(finished_at IS NULL)"
    t.index ["cron_key", "created_at"], name: "index_good_jobs_on_cron_key_and_created_at_cond", where: "(cron_key IS NOT NULL)"
    t.index ["cron_key", "cron_at"], name: "index_good_jobs_on_cron_key_and_cron_at_cond", unique: true, where: "(cron_key IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_jobs_on_finished_at_only", where: "(finished_at IS NOT NULL)"
    t.index ["job_class"], name: "index_good_jobs_on_job_class"
    t.index ["labels"], name: "index_good_jobs_on_labels", where: "(labels IS NOT NULL)", using: :gin
    t.index ["locked_by_id"], name: "index_good_jobs_on_locked_by_id", where: "(locked_by_id IS NOT NULL)"
    t.index ["priority", "created_at"], name: "index_good_job_jobs_for_candidate_lookup", where: "(finished_at IS NULL)"
    t.index ["priority", "created_at"], name: "index_good_jobs_jobs_on_priority_created_at_when_unfinished", order: { priority: "DESC NULLS LAST" }, where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at"], name: "index_good_jobs_on_priority_scheduled_at_unfinished_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["queue_name", "scheduled_at"], name: "index_good_jobs_on_queue_name_and_scheduled_at", where: "(finished_at IS NULL)"
    t.index ["scheduled_at"], name: "index_good_jobs_on_scheduled_at", where: "(finished_at IS NULL)"
  end

  create_table "installments", force: :cascade do |t|
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.datetime "created_at", null: false
    t.bigint "debt_id", null: false
    t.string "description"
    t.date "due_date", null: false
    t.enum "status", default: "upcoming", null: false, enum_type: "installment_status"
    t.datetime "updated_at", null: false
    t.index ["debt_id", "due_date"], name: "index_installments_on_debt_id_and_due_date"
    t.index ["debt_id"], name: "index_installments_on_debt_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "debt_id"
    t.text "message", null: false
    t.string "notification_type", null: false
    t.jsonb "params", default: {}
    t.boolean "read", default: false, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["debt_id"], name: "index_notifications_on_debt_id"
    t.index ["user_id", "read"], name: "index_notifications_on_user_id_and_read"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.datetime "created_at", null: false
    t.bigint "debt_id", null: false
    t.string "description"
    t.bigint "installment_id"
    t.text "rejection_reason"
    t.enum "status", default: "pending", null: false, enum_type: "payment_status"
    t.datetime "submitted_at", null: false
    t.bigint "submitter_id", null: false
    t.datetime "updated_at", null: false
    t.index ["debt_id", "status"], name: "index_payments_on_debt_id_and_status"
    t.index ["debt_id"], name: "index_payments_on_debt_id"
    t.index ["installment_id"], name: "index_payments_on_installment_id"
    t.index ["submitter_id"], name: "index_payments_on_submitter_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "full_name", null: false
    t.string "locale", default: "en"
    t.string "personal_id", null: false
    t.string "provider"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["personal_id"], name: "index_users_on_personal_id", unique: true
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "witnesses", force: :cascade do |t|
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.bigint "debt_id", null: false
    t.enum "status", default: "invited", null: false, enum_type: "witness_status"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["debt_id", "user_id"], name: "index_witnesses_on_debt_id_and_user_id", unique: true
    t.index ["debt_id"], name: "index_witnesses_on_debt_id"
    t.index ["user_id"], name: "index_witnesses_on_user_id"
  end

  add_foreign_key "debts", "users", column: "borrower_id"
  add_foreign_key "debts", "users", column: "lender_id"
  add_foreign_key "debts", "users", column: "upgrade_recipient_id"
  add_foreign_key "installments", "debts"
  add_foreign_key "notifications", "debts"
  add_foreign_key "notifications", "users"
  add_foreign_key "payments", "debts"
  add_foreign_key "payments", "installments"
  add_foreign_key "payments", "users", column: "submitter_id"
  add_foreign_key "witnesses", "debts"
  add_foreign_key "witnesses", "users"
end
