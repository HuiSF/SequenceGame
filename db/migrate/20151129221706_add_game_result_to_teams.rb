class AddGameResultToTeams < ActiveRecord::Migration
  def change
  	change_table :teams do |t|
  		t.integer :game_result
  	end
  end
end
