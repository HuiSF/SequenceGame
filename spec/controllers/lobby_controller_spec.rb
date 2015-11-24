require 'rails_helper'

RSpec.describe LobbyController, type: :controller do

  describe "GET #boards" do
    it "returns http success" do
      get :boards
      expect(response).to have_http_status(:success)
    end
  end

end
