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
  def in_game_leave
    board = Board.find(params[:board_id])
    user = User.find(params[:user_id])

    board.teams.each do |team|
      team.users.each do |each_user|
        each_user.current_team = nil
        each_user.status = :lobby
        each_user.save
      end
    end
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

    start(params[:channel_name], params[:user_update_event_name])

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

    if board.can_add_token?(params[:position])
      user.add_token(params[:card], params[:position])
    end

    discard(board, user, params[:card])
    draw(board, user)

    push_public_board_info(params[:channel_name], params[:public_update_event_name], board)
    push_user_hand_info(params[:channel_name], params[:user_update_event_name], user)

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

    if user.can_remove_token(params[:card], params[:position])
      if board.remove_token(params[:position])
        discard(board, user, params[:card])
        draw(board, user)
      end
    end

    push_public_board_info(params[:channel_name], params[:public_update_event_name], board)
    push_user_hand_info(params[:channel_name], params[:user_update_event_name], user)

  end

  protected

  # check if game is ready to start
  # :board_id
  # :channel_name
  # :user_hand_event_name{_:id}
  def start(channel_name, user_event_name)

    ready = true

    board = Board.find(params[:board_id])
    board.teams.each do |team|
      team.users.each do |user|
        if not user.state.eql? 'ready'
          ready = false
          break
        end
      end
    end

    if ready
      (1..5).each do |deal|
        board.users.each do |user|
          user.hand.push(board.deck.pop)
          user.save
          board.save
          push_user_hand_info(channel_name, user_event_name + user.id.to_s, user)
        end
      end
    end
  end

  def discard(board, user, card)
    position = user.hand.index(card)
    if position != nil
      board.last_discard = user.hand.delete_at(position)
      board.save
      user.save
    end
  end

  def draw(board, user)
    # if we want to deal from the top of the deck rather than the end, we can change this
    if board.deck.empty?
      shuffleDeck
    end
    user.hand.push(board.deck.pop)
    board.save
    user.save
  end

  def shuffleDeck
    @board.deck = (1..104).to_a.shuffle
    @board.teams.each do |team|
      team.users.each do |user|
        user.hand.each do |card|
          position = @board.deck.index(card)
          @board.deck.delete_at(position)
          @board.save
        end
      end
    end
  end

  def json_request?
    request.format.json?
  end

  def push_public_board_info(channel_name, event_name, board)
    board_json = {}
    board_json['board'] = []
    board_json['teams'] = []
    board_json['users'] = []

    board_json['board'].push(
        {:board_id => board.id, :number_of_players => board.number_of_players, :current_team_id => board.current_team, :last_discarded => board.last_discard}
    )

    board.teams.each do |team|
      board_json['teams'].push(
          {:team_id => team.id, :color => team.color, :current_user_id => team.current_user, :tokens => team.tokens, :sequences => team.sequences}
      )
      team.users.each do |user|
        board_json['users'].push(
            {:user_id => user.id, :username => user.username, :avatar => user.avatar, :current_team_id => user.current_team}
        )
      end
    end
    Pusher[channel_name].trigger(event_name, board_json)
  end

  def push_user_hand_info(channel_name, event_name, user)
    user_json = []
    user_json.push(
        {:user_id => user.id, :username => user.username, :avatar => user.avatar, :current_team_id => user.current_team, :hand => user.hand}
    )
    Pusher[channel_name].trigger(event_name, user_json)
  end

end
