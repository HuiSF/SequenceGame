class LobbyController < ApplicationController
  def boards
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

      render :json => @boards_json
    end
  end
end
