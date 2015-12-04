var DeckCard = function (id, suit, rank, game) {
  this.initialize(id, suit, rank, game);
};

DeckCard.prototype= {
  constructor: DeckCard,
  initialize: function (id, suit, rank, game) {
    this.game = game;
    this.id = id;
    this.suit = suit;
    this.rank = rank;
    this.floatUp = false;
    this.floatDown = false;
    this.floatUpLimit = -24;
    this.floatDownLimit = 24;
    this.up = false;
    this.down = true;
    this.canDiscard = true;
    this.handCards = this.game.containers.handContainer.handCards;
    this.boardCards = this.game.board.cards;
    this.pairBoardCards = [];
    this.moving = false;
    this.idInDeck = 0;
    if (this.rank === 0) {
      this.spriteName = 'back.png';
    } else {
      if (this.rank < 10) {
        this.spriteName = suit + '_0' + rank + '.png';
      } else {
        this.spriteName = suit + '_' + rank + '.png';
      }
    }

  },
  loadTexture: function (textures) {
    this.cardTexture = new PIXI.Sprite(textures[this.spriteName]);
    this.cardTexture.interactive = true;
    if (this.rank !== -1) this.bindEvents();
    this.getPairFromBoard();
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
  updateCard: function (texture, cardData, idInDeck) {
    for (i = 0; i < this.pairBoardCards.length; i++) {
      this.pairBoardCards[i].unhighlight();
    }
    // this.startToFloatDown();
    this.suit = cardData.suit;
    this.rank = cardData.rank;
    this.idInDeck = idInDeck;
    this.cardTexture.texture = texture;
    this.getPairFromBoard();
  },
  getPairFromBoard: function () {
    this.pairBoardCards = [];
    for (i = 0; i < this.boardCards.length; i++) {
      if (this.suit === this.boardCards[i].suit && this.rank === this.boardCards[i].rank) {
        this.pairBoardCards.push(this.boardCards[i]);
      }
    }
  },
  startToFloatUp: function () {
    var i;
    for (i = 0; i < this.handCards.length; i++) {
      if (this.id != this.handCards[i].id) {
        if (this.handCards[i].up === true)
          this.handCards[i].startToFloatDown();
      }
    }
    for (i = 0; i < this.pairBoardCards.length; i++) {
      this.pairBoardCards[i].highlight();
      this.pairBoardCards[i].anyToken = true;
    }
    this.moving = true;
    this.floatUp = true;

    // this.cardTexture.filters = [shadow];
  },
  startToFloatDown: function () {
    for (i = 0; i < this.pairBoardCards.length; i++) {
      this.pairBoardCards[i].unhighlight();
    }
    this.moving = true;
    this.floatDown = true;
    // this.cardTexture.filters = [];
  },
  update: function () {
    // console.log('updating');
    var originalPositionX = this.cardTexture.position.x;
    var originalPositionY = this.cardTexture.position.y;
    if (this.floatUp) {
      this.setPosition(originalPositionX, originalPositionY - 4);
      if (this.cardTexture.position.y === this.floatUpLimit) {
        this.floatUp = false;
        this.up = true;
        this.down = false;
        this.moving = false;
      }
    }
    if (this.floatDown) {
      this.setPosition(originalPositionX, originalPositionY + 4);
      if (this.cardTexture.position.y === this.floatDownLimit) {
        this.floatDown = false;
        this.up = false;
        this.down = true;
        this.moving = false;
      }
    }
  },
  bindEvents: function () {
    var _this = this;
    this.cardTexture.mouseover = function (e) {
      // if (!_this.moving)
      //   this.position.y = this.position.y - 2;
    };
    this.cardTexture.mouseout = function (e) {
      // if (!_this.moving)
      //   this.position.y = this.renderedPositionY;
    };
    this.cardTexture.mousedown = function (e) {
      // this.position.y += 2;
    };
    this.cardTexture.tap = function (e) {
      // this.position.y += 2;
      // setTimeout(function () {
      //   _this.cardTexture.position.y -= 2;
      // }, 100);
      if (_this.up) {
        _this.startToFloatDown();
      } else if (_this.down) {
        _this.startToFloatUp();
      }
    };
    this.cardTexture.mouseup = function (e) {
      // this.position.y -= 2;
      _this.game.currentChosenCardInHand = _this.idInDeck;
      if (_this.cardTexture.position.y === -24) {
        _this.startToFloatDown();
      } else {
        _this.startToFloatUp();
      }

    };
  }

};
