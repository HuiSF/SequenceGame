class Board < ActiveRecord::Base
  has_many :teams, :foreign_key => "board_id"
  belongs_to :current_team, :class_name => "Team"
end
