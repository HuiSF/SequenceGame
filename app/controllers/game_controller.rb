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
    @user = User.find(params[:user_id])
    response = {}
    response['all_ready'] = true
    user = User.find(params[:user_id])
    user.state = :ready
    user.save

    # todo
    # check if all users in current board have a ready states
    # if not, assign false to User.find(params[:user_id])
    # otherwise, trigger pusher
    # Pusher[@channel_name].trigger(@public_update_even_name, public_board_info)
    # Pusher[@channel_name].trigger(@user_update_event_name, user_hand_info)
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

end
