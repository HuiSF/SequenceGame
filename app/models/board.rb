# == Schema Information
#
# Table name: boards
#
#  id                :integer          not null, primary key
#  current_team      :integer
#  deck              :text             default([]), is an Array
#  last_discard      :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  number_of_seats   :integer
#  number_of_players :integer
#

class Board < ActiveRecord::Base
  has_many :teams, :foreign_key => "board_id"
  belongs_to :current_team, :class_name => "Team"

  scope :seats_available,	->{where("number_of_seats > 0")}

  def number_of_players_per_team
  	self.number_of_seats == 4 ? 2 : 1
  end

  def update_number_of_seats
  	available = self.number_of_players
  	self.teams.each do |team|
  		available -= team.users.count
  	end
  	self.number_of_seats = available
  end

end
