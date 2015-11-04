require 'sinatra'
require 'pusher'
require 'json'

require_relative 'activity'
require_relative 'chats_config'

include Rack::Utils
set :public_folder, '../'

get '/' do
  File.read('../index.html')
end
class ChatsController < ApplicationController

  def index

  end

  def get_post
    # post '/chats' do
      chat_info = params[:chat_info]

      channel_name = nil

      if( !chat_info )
        status 400
        body 'chat_info must be provided'
      end

      if( !request.referer )
        status 400
        body 'channel name could not be determined from request.referer'
      end

      channel_name = get_channel_name(request.referer)
      options = sanitise_input(chat_info)

      activity = Activity.new('chat-message', options['text'], options)

      data = activity.getMessage()
      response = Pusher[channel_name].trigger('chat_message', data)

      result = {'activity' => data, 'pusherResponse' => response}

      status 200
      headers \
        'Cache-Control' =>  'no-cache, must-revalidate',
        'Content-Type' =>  'application/json'

      body result.to_json
    # end
  end
end
