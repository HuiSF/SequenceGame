class CreateTeams < ActiveRecord::Migration
  def change
    create_table :teams do |t|
      t.integer :color
      t.has_many :users, index: true
      t.has_one :user, foreign_key: "current_user", index: true
      t.has_one :user, foreign_key: "next_user", index: true
      t.array :tokens
      t.array :sequences

      t.timestamps null: false
    end
    change_table :users do |t|
      t.belongs_to :team, foreign_key: "current_team", index: true
      t.has_many :teams, foreign_key: "past_teams"
      t.string :username, null: false
      t.string :avatar
      t.array :hand

    end

    create_table :past_teams do |t|
      t.belongs_to :team, index: true
      t.belongs_to :user, index: true
    end

  end
end


