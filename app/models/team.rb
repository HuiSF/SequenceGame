class Team < ActiveRecord::Base
  enum color: [:red, :blue, :green]
  has_and_belongs_to_many :users
  has_one :current_user, :class_name => 'User', :foreign_key => 'current_user_id'
  has_one :next_user, :class_name => 'User', :foreign_key => 'next_user_id'
end
