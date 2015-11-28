class BoardsController < ApplicationController
  protect_from_forgery
  skip_before_action :verify_authenticity_token, if: :json_request?
  @is_pusher_set = false
  # page to list all boards (the lobby)
  def index
    # initialize pusher
    # when json data is ready call push_info(data)
    @channel_name = get_channel_name(request.original_url)
    @update_boards_event = 'updata_boards'
    @boards_2p = Board.find_by_number_of_players(2)
    @boards_3p = Board.find_by_number_of_players(3)
    @boards_4p = Board.find_by_number_of_players(4)
  end

  # page to show a single board (game view)
  def show
    @board = Board.find(params[:id])
    respond_to do |format|
      format.html
      format.json {render :json => @board}
    end
  end

  # page to make a new board
  def new

  end

  # create a new board
  def create

  end

  # page to edit board with :id
  def edit

  end

  # update board with :id
  def update

  end

  # delete board with :id
  def destroy

  end

  # the users for this board
  #   board_id
  def users
    @users = []
    teams = Board.find(params[:board_id]).teams.all
    teams.each do |team|
      @users.push(team.users.all)
    end
  end

  # add a token to the board
  #   board_id
  #   user_id
  #   position (token)
  #   card (token)
  def addToken

  end

  # remove a token from the board
  #   board_id
  #   user_id
  #   position (token)
  #   card (token)
  def removeToken

  end

  # update last_discarded, remove last_discarded from deck, and (?)
  # update user hand (i.e., "draw")
  #   board_id
  #   user_id
  def discard

  end

  # notify team to add new sequence, check for win,
  # lock positions (so tokens cannot be removed from sequence)
  #   board_id
  #   team_id
  def addSequence

  end

  def push_info(data)
    # data will be the json of boards\' data
    Pusher[@channel_name].trigger(@update_boards_event, data);
  end

  protected

  def json_request?
    request.format.json?
  end

  def get_channel_name(http_referer)
    pattern = /(\W)+/
    channel_name = http_referer.gsub pattern, '-'
    channel_name
  end
end
