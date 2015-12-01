class WelcomeController < ApplicationController
  def index
    if signed_in?
      redirect_to :controller => 'boards', :action => 'index'
    else
      redirect_to :controller => 'devise/sessions', :action => 'new'
    end
  end
end
