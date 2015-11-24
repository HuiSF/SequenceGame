class AddingNumberOfPlayers < ActiveRecord::Migration
  def change
    change_table :boards do |t|
      t.integer :number_of_seats
      t.integer :number_of_players
    end
  end
end
