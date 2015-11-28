function Lobby(pusher, options) {
  var _this = this;

  this._pusher = pusher;

  options = options || {};
  this.settings = $.extend({
    maxMessages: 100,
    chatsEndPoint: '/',
    boardsEndPoint: '/',
    channelName: document.location.href,
    appendTo: '.chat-container',
    debug: true
  }, options);

  if (this.settings.debug && !Pusher.log) {
    Pusher.log = function(msg) {
      if (console && console.log) {
        console.log(msg);
      }
    };
  }

  this.settings.channelName = Lobby.getValidChannelName(this.settings.channelName);
  this._channel = this._pusher.subscribe(this.settings.channelName);

  this._channel.bind('updata_boards', function(data) {
    _this._updateBoards(data);
  });
  this._channel.bind('chat-message', function(data) {
    _this._chatMessageReceived(data);
  });

  // this._ping();

  this._itemCount = 0;
  this._widget = Lobby._createHTML(this.settings.appendTo);
  this._nicknameEl = this._widget.find('input[name=nickname]');
  this._emailEl = this._widget.find('input[name=email]');
  this._messageInputEl = this._widget.find('textarea');
  this._messagesEl = this._widget.find('ul');

  this._widget.find('button').click(function(e) {
    e.preventDefault();
    _this._sendChatButtonClicked();
  });
  this._widget.find('textarea').keydown(function(e) {
    var code = e.keyCode || e.which;
    if (code === 13) {
      e.preventDefault();
      _this._sendChatButtonClicked();
    }
  });

  var messageEl = this._messagesEl;
  messageEl.scroll(function() {
    var el = messageEl.get(0);
    var scrollableHeight = (el.scrollHeight - messageEl.height());
    _this._autoScroll = (scrollableHeight === messageEl.scrollTop());
  });

  this._startTimeMonitor();
}


/* @private */
Lobby.prototype._chatMessageReceived = function(data) {
  console.log('message coming');
  var _this = this;

  if (this._itemCount === 0) {
    this._messagesEl.html('');
  }

  var messageEl = Lobby._buildListItem(data);
  messageEl.hide();
  this._messagesEl.append(messageEl);
  messageEl.slideDown(function() {
    if (_this._autoScroll) {
      var messageEl = _this._messagesEl.get(0);
      var scrollableHeight = (messageEl.scrollHeight - _this._messagesEl.height());
      _this._messagesEl.scrollTop(messageEl.scrollHeight);
    }
  });

  ++this._itemCount;

  if (this._itemCount > this.settings.maxItems) {
    /* get first li of list */
    this._messagesEl.children(':first').slideUp(function() {
      $(this).remove();
    });
  }
};

/* @private */
Lobby.prototype._sendChatButtonClicked = function() {
  var message = $.trim(this._messageInputEl.val());
  if (!message) {
    alert('please supply a chat message');
    return;
  }

  var chatInfo = {
    nickname: currentUser,
    text: message,
    chatEvent: 'chat-message'
  };
  this._sendChatMessage(chatInfo);
};

/* @private */
Lobby.prototype._sendChatMessage = function(data) {
  var _this = this;

  this._messageInputEl.attr('readonly', 'readonly');
  $.ajax({
    url: this.settings.chatsEndPoint,
    type: 'post',
    dataType: 'json',
    data: {
      'chat_info': data
    },
    complete: function(xhr, status) {
      // console.log(xhr);
      // console.log(status);
      // Pusher.log('Chat message sent. Result: ' + status + ' : ' + xhr.responseText);
      if (xhr.status === 200) {
        _this._messageInputEl.val('');
      }
      _this._messageInputEl.removeAttr('readonly');
    },
    success: function(result) {
      console.log(result);
      var activity = result.activity;
      var imageInfo = activity.actor.image;
      var image = $('<div class="pusher-chat-widget-current-user-image">' +
        '<img src="' + imageInfo.url + '" width="32" height="32" />' +
        '</div>');
      var name = $('<div class="pusher-chat-widget-current-user-name">' + activity.actor.displayName.replace(/\\'/g, "'") + '</div>');
      var header = _this._widget.find('.pusher-chat-widget-header');
      header.html(image).append(name);
    }
  });
};

/* @private */
Lobby.prototype._startTimeMonitor = function() {
  var _this = this;

  setInterval(function() {
    _this._messagesEl.children('.activity').each(function(i, el) {
      var timeEl = $(el).find('a.timestamp span[data-activity-published]');
      var time = timeEl.attr('data-activity-published');
      var newDesc = Lobby.timeToDescription(time);
      timeEl.text(newDesc);
    });
  }, 10 * 1000);
};

/* @private */
Lobby._createHTML = function(appendTo) {
  var html = '' +
    '<div class="pusher-chat-widget">' +
    '<div class="pusher-chat-widget-messages">' +
    '<ul class="activity-stream">' +
    '<li class="initial">No chat messages available</li>' +
    '</ul>' +
    '</div>' +
    '<div class="pusher-chat-widget-input col-sm-12">' +
    '<div class="col-sm-10"><textarea name="message" rows="4" maxlength="140" placeholder="Input message, press enter or click send button to send"></textarea></div>' +
    '<div class="col-sm-2"><button class="pusher-chat-widget-send-btn">Send</button></div>' +
    '</div>' +
    '</div>';
  var widget = $(html);
  $(appendTo).append(widget);
  return widget;
};

/* @private */
Lobby._buildListItem = function(activity) {
  var li = $('<li class="activity"></li>');
  li.attr('data-activity-id', activity.id);
  var item = $('<div class="stream-item-content"></div>');
  li.append(item);

  var imageInfo = activity.actor.image;
  var image = $('<div class="image">' +
    '<img src="' + imageInfo.url + '" width="' + imageInfo.width + '" height="' + imageInfo.height + '" />' +
    '</div>');
  item.append(image);

  var content = $('<div class="content"></div>');
  item.append(content);

  var myself = '';
  if (activity.actor.displayName.replace(/\\'/g, "'") === currentUser) {
    myself = 'myself';
  }
  var user = $('<div class="activity-row">' +
    '<span class="user-name">' +
    '<span class="screen-name ' + myself + '">' + activity.actor.displayName.replace(/\\'/g, "'") + '</span>' +
    '</span>' +
    '</div>');
  content.append(user);

  var message = $('<div class="activity-row">' +
    '<div class="text">' + activity.body.replace(/\\('|&quot;)/g, '$1') + '</div>' +
    '</div>');
  content.append(message);

  var time = $('<div class="activity-row">' +
    '<span class="timestamp" title="' + activity.published + '" data-activity-published="' + activity.published + '">' + Lobby.timeToDescription(activity.published) + '</span>' +
    '<span class="activity-actions">' +
    '</span>' +
    '</div>');
  content.append(time);


  return li;
};

/**
 * converts a string into something which can be used as a valid channel name in Pusher.
 * @param {String} from The string to be converted.
 *
 * @see http://pusher.com/docs/client_api_guide/client_channels#naming-channels
 */
Lobby.getValidChannelName = function(from) {
  var pattern = /(\W)+/g;
  return from.replace(pattern, '-');
};

/**
 * converts a string or date parameter into a 'social media style'
 * time description.
 */
Lobby.timeToDescription = function(time) {
  if (time instanceof Date === false) {
    time = new Date(Date.parse(time));
  }
  var desc = "dunno";
  var now = new Date();
  var howLongAgo = (now - time);
  var seconds = Math.round(howLongAgo / 1000);
  var minutes = Math.round(seconds / 60);
  var hours = Math.round(minutes / 60);
  if (seconds === 0) {
    desc = "just now";
  } else if (minutes < 1) {
    desc = seconds + " second" + (seconds !== 1 ? "s" : "") + " ago";
  } else if (minutes < 60) {
    desc = "about " + minutes + " minute" + (minutes !== 1 ? "s" : "") + " ago";
  } else if (hours < 24) {
    desc = "about " + hours + " hour" + (hours !== 1 ? "s" : "") + " ago";
  } else {
    desc = time.getDay() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"][time.getMonth()];
  }
  return desc;
};

Lobby.prototype._updateBoards = function(data) {
  console.log(data);
};
