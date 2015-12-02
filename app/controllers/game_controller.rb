class GameController < ApplicationController
  protect_from_forgery
  skip_before_action :verify_authenticity_token, if: :json_request?

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
    user = User.find(params[:user_id])
    user.state = :ready
    user.save
  end

  def add_token

  end

  def remove_token

  end

end
