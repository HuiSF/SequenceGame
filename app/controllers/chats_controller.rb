require 'sinatra'
require 'pusher'
require 'json'

require_relative 'activity'
require_relative 'chats_config'

include Rack::Utils
set :public_folder, '../'

# get '/' do
#   File.read('../index.html')
# end
class ChatsController < ApplicationController
  layout false
  protect_from_forgery
  skip_before_action :verify_authenticity_token, if: :json_request?

  def index
  end

  def post
    chat_info = params[:chat_info]
    @chat_event = chat_info["chatEvent"].to_s
    @channel_name = nil
    # if( !chat_info )
    #   status 400
    #   body 'chat_info must be provided'
    # end
    #
    #   if( !request.referer )
    #     status 400
    #     body 'channel name could not be determined from request.referer'
    #   end
    @channel_name = get_channel_name(request.referer)
    options = sanitise_input(chat_info)
    activity = Activity.new(@chat_event, options['text'], options)
    data = activity.getMessage
    Pusher[@channel_name].trigger(@chat_event, data)
  end

  def get_channel_name(http_referer)
    pattern = /(\W)+/
    channel_name = http_referer.gsub pattern, '-'
    channel_name
  end

  def sanitise_input(chat_info)
    email = chat_info['email'] ? chat_info['email'] : ''

    options = {}
    options['userId'] = chat_info['userId'];
    options['displayName'] = escape_html(chat_info['nickname']).slice(0, 30)
    options['text'] = escape_html(chat_info['text']).slice(0, 300)
    options['email'] = escape_html(email).slice(0, 100)
    options['get_gravatar'] = true
    options
  end

  protected

  def json_request?
    request.format.json?
  end
end
