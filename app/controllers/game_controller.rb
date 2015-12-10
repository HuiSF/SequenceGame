require 'pusher'
require 'json'
require 'uri'

class GameController < ApplicationController
  protect_from_forgery
  skip_before_action :verify_authenticity_token, if: :json_request?

  # check if table are full
  # :board_id
  # :channel_name
  # :event_name
  def board_full
    @board = Board.find(params[:board_id])
    @channel_name = params[:channel_name]
    @event_name = params[:event_name]
    response = {}
    response['board_full'] = true
    if @board.number_of_players < @board.number_of_seats
      response['board_full'] = false
    else
      response['game_start'] = true
      Pusher[@channel_name].trigger(@event_name, response);
    end
    render :json => response
  end

  # user leaves
  # board_id
  # user_id
  # channel_name
  # public_update_event_name (pusher event)
  def in_game_leave
    board = Board.find(params[:board_id])
    user = User.find(params[:user_id])
    losing_team = user.current_team

    board.teams.each do |team|
      team.game_result = team == losing_team ? :loss : :win
      team.save
    end
    push_public_board_info(params[:channel_name], params[:public_update_event_name], board.id, {game_abort: true})
    board.users.each do |each_user|
      each_user.current_team = nil
      each_user.state = :lobby
      each_user.save
    end
    board.update_number_of_players
    board.save
    reset_board(board)
    render :json => {'success' => true}
  end

  # notify that passed in user is ready
  # user_id
  # channel_name
  # user_update_event_name
  def ready
    # @channel_name = params[:channel_name];
    # @public_update_even_name = params[:public_update_even_name]
    # @user_update_event_name = params[:user_update_event_name]
    # @users_are_ready_event_name = params[:users_are_ready_event_name]
    # @board = Board.find(params[:board_id])
    # @user = User.find(params[:user_id])
    response = {}
    response['success'] = true
    user = User.find(params[:user_id])
    user.state = :ready
    user.save

    start(params[:channel_name], params[:public_update_event_name], params[:user_update_event_name], Board.find(params[:board_id]))

    # @board.teams.each do |team|
    #   team.users.each do |auser|
    #     state = auser.state
    #     if !state.eql?('ready') # here can't use :ready has to use 'ready' for comparison...'
    #       response['all_ready'] = false
    #       break
    #     end
    #   end
    # end
    # if (response['all_ready'])
    #   Pusher[@channel_name].trigger(@users_are_ready_event_name, {'all_ready' => true, 'user_id' => params[:user_id]})
    #   push_public_board_info(@channel_name, @public_update_even_name, @board)
    #   push_user_hand_info(@channel_name, @user_update_event_name, user)
    # end
    render :json => response
  end

  # add a token to the board
  #   board_id
  #   user_id
  #   position (token)
  #   card (token)
  #   channel_name (pusher channel)
  #   public_update_event_name (pusher event)
  #   user_update_event_name (pusher event)
  def add_token
    board = Board.find(params[:board_id])
    user = User.find(params[:user_id])

    if board.current_team.current_user == user

      if board.can_add_token?(params[:position])
        user.add_token(params[:card], params[:position])

        board = Board.find(params[:board_id])
        if board.current_team_has_won?
          STDERR.puts "========================="
          STDERR.puts "game ended"
          STDERR.puts "========================="
          board.process_win(board.current_team)
          push_public_board_info(params[:channel_name], params[:public_update_event_name], board.id, {game_abort: true})
          push_user_hand_info(params[:channel_name], params[:user_update_event_name], user)
          board.users.each do |each_user|
            each_user.current_team = nil
            each_user.hand = nil
            each_user.state = :lobby
            each_user.save
          end
          board.update_number_of_players
          board.save
          reset_board(board)
        else
          discard(board, user, params[:card])
          end_turn(board)

          push_public_board_info(params[:channel_name], params[:public_update_event_name], board.id, {token_added_position: params[:position], team_id: user.current_team.id, team_color: user.current_team.color})
          push_user_hand_info(params[:channel_name], params[:user_update_event_name], user)
        end

        render :json => {:success => true}
      else
        render :json => {:success => false, :reason => 'cannot add a token here'}
      end

    else
      render :json => {:success => false, :reason => 'not this user\'s current turn'}
    end

  end

  # add a token to the board
  #   board_id
  #   user_id
  #   position (token)
  #   card (token)
  #   channel_name (pusher channel)
  #   public_update_event_name (pusher event)
  #   user_update_event_name (pusher event)
  def remove_token
    board = Board.find(params[:board_id])
    user = User.find(params[:user_id])
    result = {:success => false}

    if board.current_team.current_user == user
      if user.can_remove_token(params[:card], params[:position])

        if board.remove_token(params[:position])
          discard(board, user, params[:card])
          end_turn(board)
          push_public_board_info(params[:channel_name], params[:public_update_event_name], board.id, {token_removed_position: params[:position]})
          push_user_hand_info(params[:channel_name], params[:user_update_event_name], user)
          result[:success] = true
        else
          result[:reason] = 'cannot remove this token'
        end

      else
        result[:reason] = 'cannot remove this token'
      end
    else
      result[:reason] = 'not this user\'s current turn'
    end

    render :json => result
  end

  # discard non-playable card from user hand
  # board_id
  # user_id
  # card
  # channel_name
  # user_update_event_name
  def discard_non_playable
    board = Board.find(params[:board_id])
    user = User.find(params[:user_id])

    discard(board, user, params[:card])

    push_public_board_info(params[:channel_name], params[:public_update_event_name], board.id)
    push_user_hand_info(params[:channel_name], params[:user_update_event_name], user)

    render :json => {:success => true}
  end

  protected

  # check if game is ready to start
  # :board_id
  # :channel_name
  # :user_hand_event_name{_:id}
  def start(channel_name, public_update_even_name, user_event_name, board)

    ready = true

    board.teams.each do |team|
      team.users.each do |user|
        unless user.state.eql? 'ready'
          ready = false
          break
        end
      end
      team.current_user = team.users.first
      team.set_next_user
      team.save
    end

    if ready
      reset_cards(board)
      (1..5).each do |deal|
        board.users.each do |user|
          user.hand.push(board.deck.pop)
          user.save
          board.save
        end
      end
      board.current_team = board.teams.first
      board.save
    end

    push_public_board_info(channel_name, public_update_even_name, board.id)
    board.users.each do |each_user|
      push_user_hand_info(channel_name, user_event_name + each_user.id.to_s, each_user)
    end

  end

  def reset_cards(board)
    board.users.each do |each_user|
      each_user.hand = []
      each_user.save
    end
    board.deck = (1..104).to_a.shuffle
    board.save
  end

  def reset_board(board)
    reset_cards(board)
    board.teams.each do |team|
      team.tokens = []
      team.sequences = []
      team.board_id = nil
      team.save
    end
    current_team = nil
    board.create_teams
    board.save
  end

  def discard(board, user, card)
    position = user.hand.index(card)
    if position != nil
      board.last_discard = user.hand.at(position)
      board.save
      user.hand[position] = draw(board)
      user.save
    end
  end

  def draw(board)
    # if we want to deal from the top of the deck rather than the end, we can change this
    if board.deck.empty?
      shuffleDeck(board)
    end
    card = (board.deck.pop)
    board.save
    card
  end

  def shuffleDeck(board)
    board.deck = (1..104).to_a.shuffle
    board.users.each do |user|
      user.hand.each do |card|
        position = board.deck.index(card)
        board.deck.delete_at(position)
        board.save
      end
    end
  end

  def end_turn(board)
    current_team = board.current_team
    current_team.current_user = current_team.next_user
    current_team.save
    current_team.set_next_user
    pos = board.teams.index(current_team)
    board.current_team = board.teams.at(pos - 1)
    board.save
  end

  def json_request?
    request.format.json?
  end

  def push_public_board_info(channel_name, event_name, board_id, additional_options = {game_abort: false, token_added_position: nil, token_removed_position: nil})
    board = Board.find(board_id)
    board_json = {}
    board_json['board'] = {}
    board_json['teams'] = []
    board_json['users'] = []

    board_json['board'] = {
        :board_id => board.id,
        :number_of_players => board.number_of_players,
        :current_team_id => board.current_team,
        :last_discarded => board.last_discard,
    }

    if additional_options[:game_abort]
      board_json['board'][:game_abort] = true
    else
      board_json['board'][:game_abort] = false
    end

    STDERR.puts "========================="
    STDERR.puts "game_abort?" + board_json['board'][:game_abort].to_s
    STDERR.puts "game_abort passed in?" + additional_options[:game_abort].to_s
    STDERR.puts "========================="

    if additional_options[:token_added_position]
      board_json['board'][:token_added] = {success: true, position: additional_options[:token_added_position], team_id: additional_options[:team_id], team_color: additional_options[:team_color]}
    else
      board_json['board'][:token_added] = {success: false}
    end

    if additional_options[:token_removed_position]
      board_json['board'][:token_removed] = {success: true, position: additional_options[:token_removed_position]}
    else
      board_json['board'][:token_removed] = {success: false}
    end

    board.teams.each do |team|
      board_json['teams'].push(
          {:team_id => team.id, :color => team.color, :current_user_id => team.current_user,
           :tokens => team.tokens, :sequences => team.sequences, :game_result => team.game_result}
      )
      team.users.each do |user|
        board_json['users'].push(
            {:user_id => user.id, :username => user.username, :avatar => user.avatar, :current_team_info => user.current_team}
        )
      end
    end
    Pusher[channel_name].trigger(event_name, board_json)
  end

  def push_user_hand_info(channel_name, event_name, user)
    user_json = {:user_id => user.id, :username => user.username, :avatar => user.avatar, :current_team_id => user.current_team, :hand => user.hand}
    Pusher[channel_name].trigger(event_name, user_json)
  end

end
