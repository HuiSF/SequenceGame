class MoreBoardIndex < ActiveRecord::Migration
  def change
    add_index :boards, :id
  end
end
