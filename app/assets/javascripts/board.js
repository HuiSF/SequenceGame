function Board(pusher, options) {
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

  // create and subscribe to channle
  this.settings.channelName = Lobby.getValidChannelName(this.settings.channelName);
  this._channel = this._pusher.subscribe(this.settings.channelName);

  // bind pusher events
  this._channel.bind('update-waiting-user-list', function(data) {
    _this._updateWaitingUserList(data);
  });
  this._channle.bind('update-board', function (data) {
    _this._game.updateBoard(data);
  });
  this._channle.bind('update-hand-' + currentUserId, function () {
    _this._game.updateHand(data);
  });
  this._channel.bind('chat-message', function(data) {
    _this._chatMessageReceived(data);
  });

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
