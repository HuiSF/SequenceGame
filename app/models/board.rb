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

  scope :seats_available, ->{where("number_of_players < number_of_seats")}

  def number_of_players_per_team
    self.number_of_seats == 4 ? 2 : 1
  end

  def number_of_teams
    self.number_of_seats == 3 ? 3 : 2
  end

  def update_number_of_players
    taken = 0    
    self.teams.each do |team|   
      taken += team.users.count   
    end   
    self.number_of_players = taken
  end

  def create_teams
    for x in 0..(self.number_of_teams-1)
      team = Team.new(:board => self, :color => x)
      team.save
    end
  end

  def can_add_token?(token_position)
    self.teams.each do |team|
      if team.tokens.include? token_position
        return false
      end
    end
    true
  end

  def users
    results  = []
    self.teams.each do |team|
      team.users.each do |each_user|
        results.push(each_user)
      end
    end
    results
  end

  def remove_token(token_position)
    possible = true
    self.teams.each do |team|
      if team.tokens.include? token_position
        team.sequences.each do |seq|
          if seq.include? token_position
            possible = false
            break
          end
        end
        if possible
          team.tokens.delete(token_position)
          team.save
          return true
        end
        return false
      end
    end
    return false
  end

end
