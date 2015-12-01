# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :inet
#  last_sign_in_ip        :inet
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  username               :string           default(""), not null
#  avatar                 :string
#  current_team_id        :integer
#  hand                   :text             default([]), is an Array
#

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  belongs_to :current_team, :class_name => 'Team'

  def add_token(card, token_position)
    if self.hand.include?(card)
      self.current_team.tokens.push(token_position)
      self.current_team.save
      self.hand.delete(card)
      self.save
    end
  end

  def can_remove_token(card, token_position)
    self.hand.include?(card) and not self.current_team.tokens.include?(token_position)
  end

end
