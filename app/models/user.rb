class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  belongs_to :current_team, :class_name => 'Team', :foreign_key => 'current_team_id'
  has_and_belongs_to_many :teams
end
