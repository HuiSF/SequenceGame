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
  this.settings.channelName = Lobby.getValidChannelName(this.settings.channelName);
  this._channel = this._pusher.subscribe(this.settings.channelName);
  this._startWaiting(0);
  // bind pusher events
  // this._channel.bind('update-waiting-user-list', function(data) {
  //   _this._updateWaitingUserList(data);
  // });
  // this._channle.bind('update-board', function (data) {
  //   _this._game.updateBoard(data);
  // });
  // this._channle.bind('update-hand-' + currentUserId, function () {
  //   _this._game.updateHand(data);
  // });
  // this._channel.bind('chat-message', function(data) {
  //   _this._chatMessageReceived(data);
  // });


}

Board.prototype._startGame = function () {

};

Board.prototype._createChatRoom = function () {
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
};

Board.prototype._createGame = function () {
  var pusherEvent = 'game_ready';
  var $popup = $('<div class="loading-popup"><div class="loading-box"><span class="glyphicon glyphicon-refresh"></span>&nbsp;<span class="loading-text">Loading resources...</span></div></div>');
  $('body').prepend($popup);
  $popup.fadeIn(duration);
  console.log('Starting to loading resources');
  this._game = new Game();
};

Board.prototype._startWaiting = function (duration) {
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
    url: this.settings.checkGameStartEndPoint,
    data: {
      user_id: currentUserId,
      board_id: currentBoardId,
      channelName: this.settings.channelName,
      eventName: pusherEvent
    },
    success: function (data) {
      if (this.settings.debug) {
        console.log('User waiting channel and event sent');
        console.log(data.status);
      }
    }
  });
};

Board.prototype._endWaiting = function () {
  $('.waiting-box').children('p').text('All players arrived, the game will start now!');
  $('.waiting-box').children('form').remove();
  setTimeout(function () {
    $('.waiting-popup').fadeOut(300);
    $('.waiting-popup').delay(300).remove();
  }, 4000);
};

Board.prototype._startLoading = function () {

};

Board.prototype._endLoading = function () {

};
