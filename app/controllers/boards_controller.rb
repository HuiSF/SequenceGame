class BoardsController < ApplicationController
  # page to list all boards (the lobby)
  def index
    @boards_2p = Board.find_by_number_of_players(2)
    @boards_3p = Board.find_by_number_of_players(3)
    @boards_4p = Board.find_by_number_of_players(4)
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
    # @board = Board.new(board_params)
    # if @board.save
    #   redirect_to @board
    # else
    #   render 'new'
    # end
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
    board = Board.find(params[:board_id])

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

  private

    # def board_params
    #   params.require(:board).
      
    # end
    # def board_users
      
    # end

end
