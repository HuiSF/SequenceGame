class GameController < ApplicationController
  protect_from_forgery
  skip_before_action :verify_authenticity_token, if: :json_request?

  def start

  end

  def add_token

  end

  def remove_token

  end

end
