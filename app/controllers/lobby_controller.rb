class LobbyController < ApplicationController
  def boards
    @boards_json = {}
    @boards_json['2players'] = []
    @boards_json['3players'] = []
    @boards_json['4players'] = []

    boards = Board.all
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
    # STDERR.puts @boards_json
    # @boards_json = {
    #   "2players" => [
    #     {"board_id" => 1, "number_of_seats" => 2, "number_of_players": 2, "user_avatars": []},
    #     {"board_id" => 2, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 3, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 4, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 5, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 6, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 7, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 8, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 9, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 10, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 11, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 12, "number_of_seats" => 2, "number_of_players": 0, "user_avatars": []}
    #   ],
    #   "3players" => [
    #     {"board_id" => 1, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 2, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 3, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 4, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 5, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 6, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 7, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 8, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 9, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 10, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 11, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 12, "number_of_seats" => 3, "number_of_players": 0, "user_avatars": []}
    #   ],
    #   "4players" => [
    #     {"board_id" => 1, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 2, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 3, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 4, "number_of_seats" => 4, "number_of_players": 4, "user_avatars": []},
    #     {"board_id" => 5, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 6, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 7, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 8, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 9, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 10, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 11, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []},
    #     {"board_id" => 12, "number_of_seats" => 4, "number_of_players": 0, "user_avatars": []}
    #   ]
    # }
    render :json => @boards_json
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
