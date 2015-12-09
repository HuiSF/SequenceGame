var BoardCard = function (id, suit, rank, game) {
  this.initialize(id, suit, rank, game);
};

BoardCard.prototype= {
  constructor: BoardCard,
  initialize: function (id, suit, rank, game) {
    this.id = id;
    this.suit = suit;
    this.rank = rank;
    this.game = game;
    this.hasToken = false;
    this.respondClick = false;
    this.highlighting = false;
    this.tokenSprite = null;
    if (this.rank === 0) {
      this.spriteName = 'back.png';
    } else {
      if (rank < 10) {
        this.spriteName = suit + '_0' + rank + '.png';
      } else {
        this.spriteName = suit + '_' + rank + '.png';
      }
    }
  },
  loadTexture: function (textures) {
    this.cardTexture = new PIXI.Sprite(textures[this.spriteName]);
    this.cardTexture.interactive = true;
    if (this.rank !== 0) this.bindEvents();
  },
  setPosition: function (x, y) {
    this.cardTexture.position.x = x;
    this.cardTexture.position.y = y;
    if (this.hasToken) {
      this.tokenSprite.position.x = this.cardTexture.renderedPositionX + this.cardTexture.renderedWidth - 1 - 61 * this.tokenSprite.scale.x;
      this.tokenSprite.position.y = this.cardTexture.position.y + 2;
    }
  },
  setScale: function (x, y) {
    this.cardTexture.scale.x = x;
    this.cardTexture.scale.y = y;
    if (this.hasToken) {
      this.tokenSprite.scale.x = x;
      this.tokenSprite.scale.y = y;
    }
  },
  resize: function (x, y) {
    this.cardTexture.scale.x = x;
    this.cardTexture.scale.y = y;
  },
  getTextureScale: function () {
    return this.cardTexture.scaleX;
  },
  highlight: function () {
    var cardTexture = this.cardTexture,
        zoomScale = this.game.sprites.cards.zoomScale,
        hilightScale = zoomScale + 0.15;
    this.respondClick = true;
    this.highlighting = true;
    // console.log(cardTexture, zoomScale);
    cardTexture.scale.x = cardTexture.scale.y = hilightScale;
    // cardTexture.filters = [new PIXI.filters.GlowFilter(this.game.rendererWidth, this.game.rendererHeight, 1, 0, 1, 0x0000FF, 1)];
    cardTexture.filters = [shadow];

    if (hilightScale >= 1) {
      cardTexture.position.x -= (cardTexture.renderedWidth * hilightScale - cardTexture.renderedWidth) / 2;
      cardTexture.position.y -= (cardTexture.renderedHeight * hilightScale - cardTexture.renderedHeight) / 2;
    } else {
      cardTexture.position.x -= (cardTexture.renderedWidth * 1.15 - cardTexture.renderedWidth) / 2;
      cardTexture.position.y -= (cardTexture.renderedHeight * 1.15 - cardTexture.renderedHeight) / 2;
    }
    // this.game.containers.boardContainer.removeChild(cardTexture);
    // this.game.containers.boardContainer.addChild(cardTexture);
  },
  unhighlight: function () {
    var cardTexture = this.cardTexture,
        zoomScale = this.game.sprites.cards.zoomScale;
    this.respondClick = false;
    this.highlighting = false;
    cardTexture.scale.x = cardTexture.scale.y = zoomScale;
    cardTexture.position.x = cardTexture.renderedPositionX;
    cardTexture.position.y = cardTexture.renderedPositionY;
    cardTexture.filters = null;
  },
  bindEvents: function () {
    var _this = this;
    this.cardTexture.mouseover = function (e) {
      if (_this.game.inPlaying) {
        if (_this.highlighting) {
          this.beforeMouseoverPositionY = this.position.y;
        }
        _this.cardTexture.position.y = _this.cardTexture.position.y -2;
      }
    };
    this.cardTexture.mouseout = function (e) {
      if (_this.game.inPlaying) {
        if (_this.highlighting) {
          _this.cardTexture.position.y = this.beforeMouseoverPositionY;
        } else {
          _this.cardTexture.position.y = _this.cardTexture.renderedPositionY;
        }
      }
    };
    this.cardTexture.tap = function (e) {
      if (_this.game.inPlaying) {
        this.position.y += 2;
        setTimeout(function () {
          _this.cardTexture.position.y -= 2;
        }, 100);
      }
    };
    this.cardTexture.mouseup = function (e) {
      console.log(_this.game.currentChosenCardInHandSuit, _this.game.currentChosenCardInHandRank);
      if (_this.game.inPlaying) {
        if (_this.game.currentChosenCardInHandRank == '11') {
          if (_this.game.currentChosenCardInHandSuit == 'club' || _this.game.currentChosenCardInHandSuit == 'diamond') {
            if (!_this.hasToken) {
              _this.addToken();
            }
          } else {
            if (_this.hasToken && _this.tokenColor != _this.game.teamColor) {
              _this.removeToken();
            }
          }
        } else {
          if (!_this.hasToken && _this.respondClick) {
            _this.addToken();
          }
        }
      }

      // if ((_this.game.inPlaying  && !_this.hasToken) || (_this.game.inPlaying  && _this.game.currentChosenCardInHandRank == '11')) {
      //   if (_this.respondClick) {
      //     if ((_this.game.currentChosenCardInHandSuit === 'club' || _this.game.currentChosenCardInHandSuit === 'diamond') && _this.game.currentChosenCardInHandRank == '11') {
      //       _this.addToken();
      //     } else if ((_this.game.currentChosenCardInHandSuit === 'spade' || _this.game.currentChosenCardInHandSuit === 'heart') && _this.game.currentChosenCardInHandRank == '11') {
      //       _this.removeToken();
      //     } else {
      //       _this.addToken();
      //     }
      //   }
      // }
    };
  },
  addToken: function() {
    console.log(this.hasToken);
    var _this = this;
    console.log(_this.game.currentChosenCardInHand);
      // send request to server through pusher
      $.ajax({
        type: 'POST',
        url: '/game/add_token',
        data: {
          channel_name: _this.game.pusherChannelName,
          board_id: currentBoardId,
          user_id: currentUserId,
          card: _this.game.currentChosenCardInHand,
          position: _this.id,
          user_update_event_name: 'user_hand_' + currentUserId,
          public_update_event_name: 'board_public_update'
        },
        success: function (data) {
          _this.game.$audioPlacetoken.get(0).play();
        }
      });
  },
  removeToken: function() {
    var _this = this;
    $.ajax({
      type: 'POST',
      url: '/game/remove_token',
      data: {
        channel_name: _this.game.pusherChannelName,
        board_id: currentBoardId,
        user_id: currentUserId,
        card: _this.game.currentChosenCardInHand,
        position: _this.id,
        user_update_event_name: 'user_hand_' + currentUserId,
        public_update_event_name: 'board_public_update'
      },
      success: function (data) {
        if (data.success) {

        }
      }

    });
  },
  addTokenTexture: function (teamId, color) {
    // console.log(this.suit, this.rank, color);
    if (!this.hasToken) {
      if (this.tokenSprite === null) {
        var spriteName = color + '_token.png';
        var newToken = new PIXI.Sprite(this.game.sprites.components[spriteName]);
        newToken.teamId = teamId;
        this.tokenColor = color;
        newToken.position.x = this.cardTexture.renderedPositionX + 24;
        newToken.position.y = this.cardTexture.renderedPositionY + 2;
        // this.game.board.tokens.push(newToken);
        this.tokenSprite = newToken;
      }
      this.game.containers.boardContainer.addChild(this.tokenSprite);
      this.hasToken = true;
    }
  },
  removeTokenTexture: function () {
    if (this.hasToken) {
      this.game.containers.boardContainer.removeChild(this.tokenSprite);
      this.hasToken = false;
    }
  }
};
