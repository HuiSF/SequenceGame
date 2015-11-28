class BoardsController < ApplicationController
  # page to list all boards (the lobby)
  def index
    # initialize pusher
    # when json data is ready, call push_info(data)
    @channel_name = get_channel_name(request.original_url)
    @update_boards_event = 'update_boards'
    # @boards_2p = Board.find_by_number_of_players(2)
    # @boards_3p = Board.find_by_number_of_players(3)
    # @boards_4p = Board.find_by_number_of_players(4)
  end

  # page to show a single board (game view)
  def show
    @board = Board.find(params[:id])
  end

  # page to make a new board
  def new
    @board = Board.new
  end

  # create a new board
  def create
    @board = Board.new(:number_of_players)
    @board.number_of_seats = @board.number_of_players
    @board.deck = (1...104).to_a.shuffle
    if @board.save
      redirect_to @board
    else
      render 'new'
    end
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

  # user joins the board
  # => board_id
  # => user_id
  def join
    @board = Board.find(params[:board_id])
    user = User.find(params[:user_id])
    teams = @board.teams
    if @board.number_of_seats > 0
      teams.each do |team|
        if team.users.count < @board.number_of_players_per_team
          user.current_team = team
          @board.update_number_of_seats
          break
        end
      end
    end
    push_info
  end

  # user leaves the board
  # => board_id
  # => user_id
  def leave
    @board = Board.find(params[:board_id])
    user = User.find(params[:user_id])
    user.current_team = nil
    @board.update_number_of_seats
    push_info
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
    @board = Board.find(params[:board_id])
    @user = Board.find(params[:user_id])

  end

  # notify team to add new sequence, check for win,
  # lock positions (so tokens cannot be removed from sequence)
  #   board_id
  #   team_id
  def addSequence

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

  def push_info()
    @boards_json = {}
    @boards_json['2players'] = []
    @boards_json['3players'] = []
    @boards_json['4players'] = []

    boards = Board.all
    boards.each do |each_board|
      case each_board.number_of_players
        when 2
          @boards_json['2players'].push(
              {:board_id => each_board.id, :number_of_players => each_board.number_of_players, :number_of_seats => each_board.number_of_seats}
          )
        when 3
          @boards_json['3players'].push(
              {:board_id => each_board.id, :number_of_players => each_board.number_of_players, :number_of_seats => each_board.number_of_seats}
          )
        when 4
          @boards_json['4players'].push(
              {:board_id => each_board.id, :number_of_players => each_board.number_of_players, :number_of_seats => each_board.number_of_seats}
          )
        else
          # error
      end
    end
    STDERR.puts @boards_json
    STDERR.puts @channel_name
    STDERR.puts @update_boards_event
    Pusher[@channel_name].trigger(@update_boards_event, @boards_json);
  end



  private


end
