class Team < ActiveRecord::Base
  enum color: [:red, :blue, :green]
  has_many :users, :foreign_key => "current_team_id"
  belongs_to :current_user, :class_name => "User"
  belongs_to :next_user, :class_name => "User"
  belongs_to :board
end
