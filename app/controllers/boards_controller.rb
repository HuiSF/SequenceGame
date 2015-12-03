require 'pusher'
require 'json'
require 'uri'

class BoardsController < ApplicationController
  protect_from_forgery
  skip_before_action :verify_authenticity_token, if: :json_request?
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
    @teams = []
    @users = []

    @board.teams.each do |team|
      @teams.push(team)
      @users.push(team.users.all)
    end

    @channel_name = get_channel_name(request.original_url)
    @update_game_board_event = 'update_game_board'
  end

  # page to make a new board
  def new
    @board = Board.new
  end

  # create a new board
  def create
    @board = Board.new(:number_of_seats)
    @board.number_of_players = 0
    @board.deck = (1..104).to_a.shuffle
    if @board.save
      redirect_to @board
    else
      render 'new'
    end
  end

  # user joins the board
  # => board_id
  # => user_id
  def join
    # get channel name and set event name in each session
    @channel_name = get_channel_name(request.referer)
    @update_boards_event = 'update_boards'
    @board = Board.find(params[:board_id])
    user = User.find(params[:user_id])
    result = {"joined" => false, "redirect_to_id" => ''}
    if @board.teams.count == 0
      @board.create_teams
    end
    if @board.number_of_players < @board.number_of_seats
      @board.teams.each do |team|
        if team.users.count < @board.number_of_players_per_team
          old_team = user.current_team
          user.current_team = team
          user.state = :waiting
          user.save
          @board.update_number_of_players
          @board.save
          unless old_team == nil
            old_board = old_team.board
            old_board.update_number_of_players
            old_board.save
          end
          result["joined"] = true
          result["redirect_to_id"] = @board.id
          break
        end
      end
    end
    push_boards_info
    # redirect_to @board
    render :json => result
  end

  # user leaves the board
  # => board_id
  # => user_id
  def leave
    @callbackUrl = request.protocol + request.host_with_port + '/lobby'
    @board = Board.find(params[:board_id])
    user = User.find(params[:user_id])
    @channel_name = get_channel_name(@callbackUrl)
    @update_boards_event = 'update_boards'
    user.current_team = nil
    user.state = :lobby
    user.save
    @board.update_number_of_players
    @board.save
    push_boards_info
    redirect_to '/lobby'
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
  #   channel_name (pusher channel)
  #   event_name (pusher event)
  def addToken
    board = Board.find(params[:board_id])
    user = User.find(params[:user_id])

    if board.can_add_token?(params[:position])
      user.add_token(params[:card], params[:position])
    end

    draw(board, user)

    push_game_info(params[:channel_name], params[:event_name], board)
  end

  # remove a token from the board
  #   board_id
  #   user_id
  #   position (token)
  #   card (token)
  #   channel_name (pusher channel)
  #   event_name (pusher event)
  def removeToken
    board = Board.find(params[:board_id])
    user = User.find(params[:user_id])

    if user.can_remove_token(params[:card], params[:position])
      if board.remove_token(params[:position])
        user.hand.delete(params[:card])
      end
    end

    push_game_info(params[:channel_name], params[:event_name], board)
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

  def push_boards_info
    STDERR.puts @channel_name
    STDERR.puts @update_boards_event
    @boards_json = {}
    @boards_json['2players'] = []
    @boards_json['3players'] = []
    @boards_json['4players'] = []

    boards = Board.order(:id)
    boards.each do |each_board|
      case each_board.number_of_seats
        when 2
          avatars_of_users = avatars_for_board_users(each_board)
          # push avatar paths of users who are in current board into avatars_of_users
          @boards_json['2players'].push(
              {:board_id => each_board.id, :number_of_players => each_board.number_of_players, :number_of_seats => each_board.number_of_seats, :avatars_of_users => avatars_of_users}
          )
        when 3
          avatars_of_users = avatars_for_board_users(each_board)
          # push avatar paths of users who are in current board into avatars_of_users
          @boards_json['3players'].push(
              {:board_id => each_board.id, :number_of_players => each_board.number_of_players, :number_of_seats => each_board.number_of_seats, :avatars_of_users => avatars_of_users}
          )
        when 4
          avatars_of_users = avatars_for_board_users(each_board)
          # push avatar paths of users who are in current board into avatars_of_users
          @boards_json['4players'].push(
              {:board_id => each_board.id, :number_of_players => each_board.number_of_players, :number_of_seats => each_board.number_of_seats, :avatars_of_users => avatars_of_users}
          )
        else
          # error
      end
    end
    Pusher[@channel_name].trigger(@update_boards_event, @boards_json);
  end

  def push_game_info(channel_name, event_name, board)
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
            {:user_id => user.id, :username => user.username, :avatar => user.avatar, :current_team_id => user.current_team, :hand => user.hand}
        )
      end
    end
    Pusher[channel_name].trigger(event_name, board_json)
  end

  def avatars_for_board_users(board)
    avatars = []
    board.teams.each do |team|
      team.users.each do |user|
        avatars.push({:username => user.username, :avatar => user.avatar})
      end
    end
    return avatars
  end

  def discard(user, card)
    position = user.hand.index(card)
    if position != nil
      @board.last_discard = user.hand.delete_at(position)
      @board.save
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
end
