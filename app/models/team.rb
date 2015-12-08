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

  def set_next_user
    if self.users.count == 1 
      #for 2 & 3 player games 
      self.next_user = self.current_user
    else 
      #for 4 player games
      pos = self.users.index(self.current_user)
      self.next_user = self.users.at(pos - 1)
    end
    self.save
  end

  def check_for_new_sequence(token)
    positions = [1, 10, 91, 100] # add free corner positions
    self.tokens.each do |pos|
      positions.push(pos.to_i)
    end
    self.sequence_in_row(token, positions)
    self.sequence_in_column(token, positions)
    self.sequence_in_diagonal_tl_br(token, positions)
    self.sequence_in_diagonal_tr_bl(token, positions)
  end

  protected

  def sequence_in_row(token, positions)
    # sequence can use ONE of the tokens in existed sequence
    use_existed_token = false
    interrupt_other_sequence = false
    row_pos = (token.to_i - 1) % 10 + 1
    potential_sequence = [token]

    (1..(row_pos - 1)).each do |x|
      pos = token.to_i - x
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              # Trying to use two tokens in existed sequences
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        # Using two tokens in existed sequences is illegal
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
        break
      end
      if potential_sequence.length > 4
        break
      end
    end

    # reset interrupt_other_sequence for second half of growing
    interrupt_other_sequence = false

    (1..(10 - row_pos)).each do |x|
      # check length of potential sequence BEFORE growing
      if potential_sequence.length > 4
        break
      end
      pos = token.to_i + x
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
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
    use_existed_token = false
    interrupt_other_sequence = false
    col_pos = (token.to_i - 1) / 10 + 1
    potential_sequence = [token]

    (1..(col_pos - 1)).each do |x|
      pos = token.to_i - x * 10
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
        break
      end
      if potential_sequence.length > 4
        break
      end
    end

    interrupt_other_sequence = false

    (1..(10 - col_pos)).each do |x|
      if potential_sequence.length > 4
        break
      end
      pos = token.to_i + x * 10
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
        break
      end
    end
    # if at least 5 in a row, process sequence and possibly add it to sequences
    # else do nothing
    if potential_sequence.length > 4
      self.process_potential_sequence(potential_sequence)
    end
  end

  def sequence_in_diagonal_tl_br(token, positions)
    use_existed_token = false
    interrupt_other_sequence = false
    row_pos = (token.to_i - 1) % 10 + 1
    potential_sequence = [token]

    (1..(row_pos - 1)).each do |x|
      pos = token.to_i - x * 11
      if pos < 1
        break
      end
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
        break
      end
      if potential_sequence.length > 4
        break
      end
    end

    interrupt_other_sequence = false
    (1..(10 - row_pos)).each do |x|
      if potential_sequence.length > 4
        break
      end
      pos = token.to_i + x * 11
      if pos > 100
        break
      end
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
        break
      end
    end
    # if at least 5 in a row, process sequence and possibly add it to sequences
    # else do nothing
    if potential_sequence.length > 4
      self.process_potential_sequence(potential_sequence)
    end
  end

  def sequence_in_diagonal_tr_bl(token, positions)
    use_existed_token = false
    interrupt_other_sequence = false
    row_pos = (token.to_i - 1) % 10 + 1
    potential_sequence = [token]

    (1..(row_pos - 1)).each do |x|
      pos = token.to_i + x * 9
      if pos < 1
        break
      end
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
        break
      end
      if potential_sequence.length > 4
        break
      end
    end

    interrupt_other_sequence = false
    (1..(10 - row_pos)).each do |x|
      if potential_sequence.length > 4
        break
      end
      pos = token.to_i - x * 9
      if pos > 100
        break
      end
      if(positions.include?(pos))
        self.sequences.each do |sequence|
          if sequence.include? pos.to_s
            if use_existed_token
              interrupt_other_sequence = true
            else
              use_existed_token = true
            end
            break
          end
        end
        if interrupt_other_sequence
          break
        end
        potential_sequence.push(pos.to_s)
      else
        break
      end
    end
    # if at least 5 in a row, process sequence and possibly add it to sequences
    # else do nothing
    if potential_sequence.length > 4
      self.process_potential_sequence(potential_sequence)
    end
  end

  def process_potential_sequence(potential_sequence)

    if potential_sequence.length == 5
      self.sequences.push(potential_sequence.sort)
      self.save
    end

    # TODO check for overlap

  end

end
