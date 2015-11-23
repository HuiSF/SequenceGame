class AddingArrays < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.text :hand, array: true, default: []
    end

    change_table :teams do |t|
      t.text :sequences, array: true, default: []
      t.text :tokens, array: true, default: []
    end
  end
end
