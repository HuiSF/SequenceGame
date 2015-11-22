class CreateTeams < ActiveRecord::Migration
  def change
    create_table :teams do |t|
      t.integer :color
      t.integer :current_user_id
      t.integer :next_user_id
      t.timestamps null: false
    end
    change_table :users do |t|
      t.string :username, null: false, default: ""
      t.string :avatar
      t.integer :current_team_id
    end

    add_index :users, :current_team_id
    add_index :teams, :current_user_id
    add_index :teams, :next_user_id
  end
end


