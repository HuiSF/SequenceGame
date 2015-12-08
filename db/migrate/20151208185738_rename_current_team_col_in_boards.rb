class RenameCurrentTeamColInBoards < ActiveRecord::Migration
  def change
  	rename_column :boards, :current_team, :current_team_id
  end
end
