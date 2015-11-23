class CreateBoards < ActiveRecord::Migration
  def change
    change_table :teams do |t|
      t.integer :board_id
    end

    create_table :boards do |t|
      t.integer :current_team
      t.text :deck, array: true, default: []
      t.integer :last_discard
      t.timestamps null: false
    end

    add_index :teams, :board_id
    add_index :boards, :current_team
  end
end
