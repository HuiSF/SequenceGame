# == Schema Information
#
# Table name: teams
#
#  id              :integer          not null, primary key
#  color           :integer
#  current_user_id :integer
#  next_user_id    :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  sequences       :text             default([]), is an Array
#  tokens          :text             default([]), is an Array
#  board_id        :integer
#  game_result     :integer
#

class Team < ActiveRecord::Base
  enum color: [:red, :blue, :green]
  enum game_result: [:win, :loss]
  has_many :users, :foreign_key => "current_team_id"
  belongs_to :current_user, :class_name => "User"
  belongs_to :next_user, :class_name => "User"
  belongs_to :board
end
