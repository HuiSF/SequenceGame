class BoardController < ApplicationController
  # page to list all boards (the lobby)
  def index

  end

  # page to show a single board (game view)
  def show

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

  # update board with :id )
  def update
    
  end

  # delete board with :id
  def destroy
    
  end

  # the users for this board
  def users
    
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


end
