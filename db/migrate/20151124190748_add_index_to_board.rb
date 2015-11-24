class AddIndexToBoard < ActiveRecord::Migration
  def change
    add_index :boards, :number_of_players
    add_index :boards, :number_of_seats
  end
end
