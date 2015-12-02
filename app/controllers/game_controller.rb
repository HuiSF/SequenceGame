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

  # check if game is ready to start
  # :board_id
  # :channel_name
  # :event_name
  def start
    response = {}
    response['game_ready'] = true

    board = Board.find(params[:board_id])
    board.teams.each do |team|
      team.users.each do |user|
        if user.state != :ready
          response['game_ready'] = false
          break
        end
      end
    end

    render :json => response
  end

  # notify that passed in user is ready
  # user_id
  # channel_name
  # event_name
  def ready
    @channel_name = params[:channel_name];
    @public_update_even_name = params[:public_update_even_name]
    @user_update_event_name = params[:user_update_event_name]
    @board = Board.find(params[:board_id])
    # @user = User.find(params[:user_id])
    response = {}
    response['all_ready'] = true
    user = User.find(params[:user_id])
    user.state = :ready
    user.save

    @board.teams.each do |team|
      team.users.each do |auser|
        STDERR.puts auser.state
        if auser.state.eql? :ready
          STDERR.puts "Someone is not ready"
          response['all_ready'] = false
          break
        end
      end
    end
    # todo
    # check if all users in current board have a ready states
    # if not, assign false to User.find(params[:user_id])
    # otherwise, trigger pusher
    # Pusher[@channel_name].trigger(@public_update_even_name, public_board_info)
    # Pusher[@channel_name].trigger(@user_update_event_name, user_hand_info)
    if (response['all_ready'])
      push_public_board_info(@channel_name, @public_update_even_name, @board)
      push_user_hand_info(@channel_name, @user_update_event_name, user)
    end
    render :json => response
  end

  def add_token

  end

  def remove_token

  end

  protected

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
