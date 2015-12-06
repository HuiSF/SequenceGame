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
  },
  setScale: function (x, y) {
    this.cardTexture.scale.x = x;
    this.cardTexture.scale.y = y;
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
      // this.scale.x = this.scaleX + 0.04;
      // this.scale.y = this.scaleY + 0.04;
      // if (this.scale.x >= 1) {
      //   this.position.x -= (this.renderedWidth * this.scale.x - this.renderedWidth) / 2;
      //   this.position.y -= (this.renderedHeight * this.scale.y - this.renderedHeight) / 2;
      // } else {
      //   this.position.x -= (this.renderedWidth * 1.04 - this.renderedWidth) / 2;
      //   this.position.y -= (this.renderedHeight * 1.04 - this.renderedHeight) / 2;
      // }
      // this.beforeMouseoverPositionY = this.position.y;
      // this.position.y = this.position.y - 2;
      if (_this.highlighting) {
        this.beforeMouseoverPositionY = this.position.y;
      }
      _this.cardTexture.position.y = _this.cardTexture.position.y -2;
    };
    this.cardTexture.mouseout = function (e) {
      // this.scale.x = this.scaleX;
      // this.scale.y = this.scaleY;
      // this.position.x = this.renderedPositionX;
      // this.position.y = this.renderedPositionY;
      // this.position.y = this.beforeMouseoverPositionY;
      if (_this.highlighting) {
        _this.cardTexture.position.y = this.beforeMouseoverPositionY;
      } else {
        _this.cardTexture.position.y = _this.cardTexture.renderedPositionY;
      }
    };
    this.cardTexture.mousedown = function (e) {
      if (_this.game.boardClickable) {
        // this.beforeMousedownPositionY = this.position.y;
        // this.position.y += 2;

        // this.position.y = this.beforeMouseoverPositionY;
      }
    };
    this.cardTexture.tap = function (e) {
      this.position.y += 2;
      setTimeout(function () {
        _this.cardTexture.position.y -= 2;
      }, 100);
    };
    this.cardTexture.mouseup = function (e) {
      if (_this.respondClick) {
        // this.position.y = this.beforeMousedownPositionY;
        _this.addToken();

      }
    };
  },
  addToken: function() {
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
        }
      });
  },
  addTokenTexture: function (teamId, color) {
    // console.log(this.suit, this.rank, color);
    var spriteName = color + '_token.png';
    var newToken = new PIXI.Sprite(this.game.sprites.components[spriteName]);
    newToken.teamId = teamId;
    this.hasToken = true;
    newToken.position.x = this.cardTexture.renderedPositionX + 24;
    newToken.position.y = this.cardTexture.renderedPositionY + 2;
    this.game.containers.boardContainer.addChild(newToken);
    this.game.board.tokens.push(newToken);
    this.tokenSprite = newToken;
  }
};
