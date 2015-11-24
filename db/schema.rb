# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151124190748) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "boards", force: :cascade do |t|
    t.integer  "current_team"
    t.text     "deck",              default: [],              array: true
    t.integer  "last_discard"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.integer  "number_of_seats"
    t.integer  "number_of_players"
  end

  add_index "boards", ["current_team"], name: "index_boards_on_current_team", using: :btree
  add_index "boards", ["number_of_players"], name: "index_boards_on_number_of_players", using: :btree
  add_index "boards", ["number_of_seats"], name: "index_boards_on_number_of_seats", using: :btree

  create_table "teams", force: :cascade do |t|
    t.integer  "color"
    t.integer  "current_user_id"
    t.integer  "next_user_id"
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.text     "sequences",       default: [],              array: true
    t.text     "tokens",          default: [],              array: true
    t.integer  "board_id"
  end

  add_index "teams", ["board_id"], name: "index_teams_on_board_id", using: :btree
  add_index "teams", ["current_user_id"], name: "index_teams_on_current_user_id", using: :btree
  add_index "teams", ["next_user_id"], name: "index_teams_on_next_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "username",               default: "", null: false
    t.string   "avatar"
    t.integer  "current_team_id"
    t.text     "hand",                   default: [],              array: true
  end

  add_index "users", ["current_team_id"], name: "index_users_on_current_team_id", using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

end
