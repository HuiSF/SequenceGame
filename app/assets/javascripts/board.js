function Board(pusher, options) {
  var _this = this;
  this._pusher = pusher;
  options = options || {};
  this.settings = $.extend({
    maxMessages: 100,
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

  // create and subscribe to channle
  this.settings.channelName = Board.getValidChannelName(this.settings.channelName);
  this._channel = this._pusher.subscribe(this.settings.channelName);
  this._channel.bind('chat-message', function(data) {
    _this._chatMessageReceived(data);
  });
  $('.leave').on('click', function () {
    _this._abortGame();
  });
  this._createChatRoom();
  this._startWaiting(0);
}

Board.prototype._startGame = function () {

};

Board.prototype._createChatRoom = function () {
  console.log('Creating chat room');
  var _this = this;
  this._itemCount = 0;
  this._widget = Board._createHTML(this.settings.appendTo);
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

  this.$messageSound = $('<audio class="message-sound"><source src="/images/message.mp3" type="audio/mpeg"></audio>');
  $('body').append(this.$messageSound);
  resizeGameChatRoom();
  this._startTimeMonitor();
};

Board.prototype._createGame = function () {
  var _this = this;
  this._startLoading();
  // console.log('Starting to loading resources');
  setTimeout(function () {
    _this._game = new Game({}, _this._channel, _this.settings.channelName, _this);
  }, 4000);
};

Board.prototype._startWaiting = function (duration) {
  var _this = this;
  var pusherEvent = 'game_start';
  var $popup = $('<div class="waiting-popup"><div class="waiting-box"><p>Hi ' + currentUser + ', we will be waiting for other players joining the game, Just a second! The game wil automatically start.</p><form action="/boards/leave?board_id=' + currentBoardId + '&user_id=' + currentUserId + '" method="post"><button type="submit" class="leave btn btn-info">Leave</button></form></div></div>').hide();
  $('body').prepend($popup);
  $popup.fadeIn(duration);
  // bind waiting event
  this._channel.bind(pusherEvent, function(data) {
    if (data.game_start) {
      _this._endWaiting();
      _this._createGame();
    }
  });

  // post to /boards/game_start to inform pusher channel and events
  $.ajax({
    type: 'POST',
    url: this.settings.checkBoardFull,
    data: {
      user_id: currentUserId,
      board_id: currentBoardId,
      channel_name: this.settings.channelName,
      event_name: pusherEvent
    },
    success: function (data) {
      if (_this.settings.debug) {
        // console.log('User waiting channel and event sent');
        // console.log(data);
      }
      if (data.game_start) {
        // console.log('game start');
        _this._endWaiting();
        setTimeout(function () {
          _this._createGame();
        }, 4000);

      }
    }
  });
};

Board.prototype._endWaiting = function () {
  // console.log('end wiating');
  $('.waiting-box').children('p').text('All players arrived, the game will start now!');
  $('.waiting-box').children('form').remove();
  setTimeout(function () {
    $('.waiting-popup').fadeOut(500);
    $('.waiting-popup').delay(500).remove();
  }, 4000);
};

Board.prototype._startLoading = function () {
  // console.log('start loading');
  var pusherEvent = 'game_ready';
  var $popup = $('<div class="loading-popup"><div class="loading-box"><span class="loading-indecator animate-icon glyphicon glyphicon-refresh"></span>&nbsp;<span class="loading-text">Loading resources...</span></div></div>');
  $('body').prepend($popup);
  $popup.fadeIn(0);
};

Board.prototype._endLoading = function () {
  $('.loading-indecator').removeClass('animate-icon glyphicon-refresh').addClass('glyphicon-thumbs-up');
  $('.loading-text').html('').text('Loading Complete!');
  setTimeout(function () {
    $('.loading-popup').fadeOut(500);
    $('.waiting-popup').delay(500).remove();
  }, 4000);
};

Board.prototype._abortGame = function () {
  var _this = this;
  var $popup = $('<div class="warning-popup"><div class="warning-box"><p class="text-danger"><span class="glyphicon glyphicon-exclamation-sign"></span>&nbsp;If you leave during the game, you will lose the game and abort the game!</p></div></div>');
  $warningBox = $('.warning-box', $popup);
  $leave = $('<button class="btn btn-info">Yes, leave</button>');
  $cancel = $('<button class="btn btn-info">Cancel</button>');
  $warningBox.append($leave);
  $warningBox.append($cancel);
  $popup.hide();
  $('body').prepend($popup);
  $popup.fadeIn(300);

  $leave.on('click', function() {
    _this._game.activeLeave = true;
    $.ajax({
      type: 'POST',
      url: '/game/leave',
      data: {
        board_id: currentBoardId,
        user_id: currentUserId,
        channel_name: _this.settings.channelName,
        public_update_event_name: 'board_public_update',
      },
      success: function (data) {
        if (data.success) {
          console.log('Game will be aborted now and show result.');
          $popup.remove();
          _this._game._gameOver();
        }
      }
    });
  });
  $cancel.on('click', function () {
    $popup.fadeOut(300);
    setTimeout(function () {
      $popup.remove();
    }, 300);
  });
};

/* @private */
Board.prototype._chatMessageReceived = function(data) {
  // console.log(data);
  var _this = this;

  if (this._itemCount === 0) {
    this._messagesEl.html('');
  }

  var messageEl = Board._buildListItem(data);
  messageEl.hide();
  this._messagesEl.append(messageEl);
  messageEl.slideDown(function() {
    if (_this._autoScroll) {
      var messageEl = _this._messagesEl.get(0);
      var scrollableHeight = (messageEl.scrollHeight - _this._messagesEl.height());
      _this._messagesEl.scrollTop(messageEl.scrollHeight);
    }
  });
  this.$messageSound.get(0).play();
  ++this._itemCount;

  if (this._itemCount > this.settings.maxItems) {
    /* get first li of list */
    this._messagesEl.children(':first').slideUp(function() {
      $(this).remove();
    });
  }
};

/* @private */
Board.prototype._sendChatButtonClicked = function() {
  var message = $.trim(this._messageInputEl.val());
  if (!message) {
    alert('please supply a chat message');
    return;
  }

  var chatInfo = {
    userId: currentUserId,
    nickname: currentUser,
    text: message,
    chatEvent: 'chat-message'
  };
  this._sendChatMessage(chatInfo);
};

/* @private */
Board.prototype._sendChatMessage = function(data) {
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
      // console.log(result);
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
Board.prototype._startTimeMonitor = function() {
  var _this = this;

  setInterval(function() {
    _this._messagesEl.children('.activity').each(function(i, el) {
      var timeEl = $(el).find('div.activity-row span[data-activity-published]');
      var time = timeEl.attr('data-activity-published');
      var newDesc = Board.timeToDescription(time);
      timeEl.text(newDesc);
    });
  }, 10 * 1000);
};

/* @private */
Board._createHTML = function(appendTo) {
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
Board._buildListItem = function(activity) {
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
    '<span class="timestamp" title="' + activity.published + '" data-activity-published="' + activity.published + '">' + Board.timeToDescription(activity.published) + '</span>' +
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
Board.getValidChannelName = function(from) {
  var pattern = /(\W)+/g;
  return from.replace(pattern, '-');
};

/**
 * converts a string or date parameter into a 'social media style'
 * time description.
 */
Board.timeToDescription = function(time) {
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
