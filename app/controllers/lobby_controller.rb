class LobbyController < ApplicationController
  def boards
    if request.xhr?
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
      render :json => @boards_json
    else
      redirect_to controller: 'boards', action: 'index'
    end

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
end
