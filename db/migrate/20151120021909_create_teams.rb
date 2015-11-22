class CreateTeams < ActiveRecord::Migration
  def change
    create_table :teams do |t|
      t.integer :color
      t.timestamps null: false
    end
    change_table :users do |t|
      t.string :username, null: false, default: ""
      t.string :avatar
      t.integer :current_team_id
    end
    create_table :teams_users, id: false do |t|
      t.belongs_to :team, index: true
      t.belongs_to :user, index: true
    end

    add_index :users, :current_team_id

  end
end


