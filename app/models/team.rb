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

  def check_for_new_sequence(token)
    positions = [1, 10, 91, 100] # add free corner positions
    self.tokens.each do |pos|
      positions.push(pos.to_i)
    end
    self.sequence_in_row(token, positions)
    self.sequence_in_column(token, positions)
    self.sequence_in_diagonal(token, positions)
  end


  protected

  def sequence_in_row(token, positions)
    row_pos = token.to_i % 10
    potential_sequence = [token]

    (1..(row_pos - 1)).each do |x|
      pos = token.to_i - x
      if(positions.include?(pos))
        potential_sequence.push(pos.to_s)
      else
        break
      end
      if potential_sequence.length == 5
        break
      end
    end

    (1..(10 - row_pos)).each do |x|
      pos = token.to_i + x
      if(positions.include?(pos))
        potential_sequence.push(pos.to_s)
      else
        break
      end
      if potential_sequence.length == 5
        break
      end
    end
    # if at least 5 in a row, process sequence and possibly add it to sequences
    # else do nothing
    if potential_sequence.length > 4
      self.process_potential_sequence(potential_sequence)
    end
  end

  def sequence_in_column(token, positions)
    # TODO
  end

  def sequence_in_diagonal(token, positions)
    # TODO
  end

  def process_potential_sequence(potential_sequence)

    if potential_sequence.length == 5
      self.sequences.push(potential_sequence.sort)
      self.save
    end

    # TODO check for overlap

  end

end
