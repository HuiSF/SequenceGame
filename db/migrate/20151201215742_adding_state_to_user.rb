class AddingStateToUser < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.integer :state
    end

    add_index :users, :username, unique: true
  end
end
