var Game = function(renderOptions, pusherChannel, channelName, boardView) {
  this.game_id = currentBoardId;
  this.pusherChannel = pusherChannel;
  this.pusherChannelName = channelName;
  this.boardView = boardView;
  this.renderOptions = $.extend({
    "autoResize": true,
    "resolution": 2,
    "antialias": true
  }, renderOptions);
  this.$window = $(window);
  this.$gameView = $('#game-view');
  this.rendererWidth = this.$gameView.innerWidth();
  this.rendererHeight = this.$window.innerHeight();
  this.renderer = new PIXI.WebGLRenderer(this.rendererWidth, this.rendererHeight, renderOptions);
  this.rendererView = this.renderer.view;
  this.$rendererView = $(this.rendererView);
  this.sprites = {};
  this.containers = {};
  this.board = {};
  this.board.cards = [];
  this.boardFitsWidth = true;
  this.boardScrollBottomLimit = 0;
  this._loadSprites();

};

Game.prototype._resize = function(width, height) {
  this.rendererWidth = width;
  this.rendererHeight = height;
  this.renderer.resize(width, height);
  this._resizeBackground();
  this._resizeCards();
  this._resizeHandContainer();
};

Game.prototype._loadSprites = function() {
  console.log('Start to load sprites.');
  var _this = this;
  PIXI.loader
    .add('cards', '/images/cards.json')
    .add('components', '/images/components.json')
    .add('boardData', '/data/board_data.json')
    .add('backgroundImage', '/images/game-bg.jpg')
    .load(function(loader, resources) {
      console.log('Sprites loading completed, start to initialize game view.');
      _this.sprites.cards = resources.cards.textures;
      _this.sprites.cards.originalWidth = _this.sprites.cards['back.png'].width;
      _this.sprites.cards.originalHeight = _this.sprites.cards['back.png'].height;
      _this.sprites.components = resources.components.textures;
      _this.sprites.background = resources.backgroundImage.texture;
      _this.sprites.boardData = resources.boardData.data;
      _this._initializeGameContainer();
      _this._initializeBoard();
      _this._initializeHand();
      _this._addCanvas();
      _this._start();
      // _this._setHandCard(1, {'suit':'club', 'rank': 10});
    });
};

Game.prototype._initializeGameContainer = function() {
  console.log('Initializing gameContainer...');
  this.containers.gameContainer = new PIXI.Container();
  var gameContainer = this.containers.gameContainer;
  gameContainer.interactive = true;
  gameContainer.addChild(new PIXI.Sprite(this.sprites.background));
  this._resizeBackground();
  console.log('Game container initializing completed.');
};

Game.prototype._initializeBoard = function() {
  console.log('Initializing board...');
  this.containers.boardContainer = new PIXI.Container();
  var boardContainer = this.containers.boardContainer;
  boardContainer.interactive = true;
  boardContainer.filters = [shadow];
  this._bindEventsToBoard();
  this._generateCards();
  console.log('Board initializing completed.');
};

Game.prototype._initializeHand = function() {
  console.log('initializing hand...');
  this.containers.handContainer = new PIXI.Container();
  var handContainer = this.containers.handContainer,
      componentSprites = this.sprites.components,
      cardSprites = this.sprites.cards,
      i, aCard;

  handContainer.interactive = true;
  handContainer.components = {};
  handContainer.handCards = [];
  handContainer.filters = [deckCardShadow];

  var handBackground = new PIXI.extras.TilingSprite(componentSprites['hand-background.png'], 100, 100);
  var textHandCards = new PIXI.Sprite(componentSprites['text-hand-cards.png']);
  var textDeckCards = new PIXI.Sprite(componentSprites['text-deck-cards.png']);
  var textDiscardCards = new PIXI.Sprite(componentSprites['text-discard-cards.png']);
  var deckCards = new PIXI.Sprite(componentSprites['deck-cards.png']);
  var discardCards = new PIXI.Sprite(componentSprites['discard-cards.png']);

  handContainer.components.background = handBackground;
  handContainer.components.textHandCards = textHandCards;
  handContainer.components.textDeckCards = textDeckCards;
  handContainer.components.textDiscardCards = textDiscardCards;
  handContainer.components.deckCards = deckCards;
  handContainer.components.discardCards = discardCards;

  handContainer.addChild(handBackground);
  handContainer.addChild(textHandCards);
  handContainer.addChild(textDeckCards);
  handContainer.addChild(textDiscardCards);
  handContainer.addChild(deckCards);
  handContainer.addChild(discardCards);

  // hand cards size difined by the data from back end
  for (i = 1; i <= 5; i++) {
    aCard = new DeckCard(i, 'back', 0, this);
    aCard.loadTexture(cardSprites);
    handContainer.handCards.push(aCard);
    handContainer.addChild(aCard.cardTexture);
  }
  this._resizeHandContainer();
  console.log('Hand initializing completed!');
};

Game.prototype._addCanvas = function() {
  this.containers.gameContainer.addChild(this.containers.boardContainer);
  this.containers.gameContainer.addChild(this.containers.handContainer);
  this.$rendererView.addClass('game-canvas');
  this.$gameView.append(this.$rendererView).height(this.$window.innerHeight());
};

Game.prototype._start = function() {
  var _this = this,
      handContainer = this.containers.handContainer,
      handCards = handContainer.handCards,
      i;
  // console.log(this);
  animate();
  this._gameReady();
  function animate() {
    requestAnimationFrame(animate);
    _this.renderer.render(_this.containers.gameContainer);
    for (i = 0; i < handCards.length; i++) {
      handCards[i].update();
    }
  }
};

Game.prototype._generateCards = function () {
  var boardData = this.sprites.boardData;
  var numberOfCards = boardData.numberOfCards,
      numberOfColumns = boardData.numberOfColumns,
      numberOfRows = Math.ceil(numberOfCards / numberOfColumns),
      boardContainer = this.containers.boardContainer,
      cardSprites = this.sprites.cards,
      i, aCard;
  console.log('Generating ' + numberOfCards + ' cards, ' + numberOfColumns + ' cards per row.');

  for (i = 1; i <= numberOfCards; i++) {
    aCard = new BoardCard(i, boardData[i].suit, boardData[i].rank, this);
    aCard.loadTexture(cardSprites);
    this.board.cards.push(aCard);
    boardContainer.addChild(aCard.cardTexture);
  }

  this._resizeCards();
};

Game.prototype._setHandCard = function (index, cardData) {
  // console.log(this.containers.handContainer);
  var handCards = this.containers.handContainer.handCards,
      cardSprites = this.sprites.cards,
      spriteName;
  if (cardData.rank === 0) {
    spriteName = 'back.png';
  } else {
    if (cardData.rank < 10) {
      spriteName = cardData.suit + '_0' + cardData.rank + '.png';
    } else {
      spriteName = cardData.suit + '_' + cardData.rank + '.png';
    }
  }
  handCards[index].updateCard(cardSprites[spriteName], cardData);
  // console.log(handCards);
};

Game.prototype._bindEventsToBoard = function () {
    var boardContainer = this.containers.boardContainer,
        _this = this;
    _this.$gameView.on('mousewheel', function (e) {
      // console.log(e.originalEvent.changedTouches[0]);
      var upLimit = 0 - (boardContainer.renderedHeight - _this.rendererHeight + 150);
      var downLimit = -14;
      if (e.deltaY < 0 && boardContainer.position.y >= upLimit) {
        boardContainer.position.y -= 14;
      } else if (e.deltaY > 0 && boardContainer.position.y <= downLimit) {
        boardContainer.position.y += 14;
      }
    });
};

Game.prototype._resizeBackground = function() {
  var background = this.containers.gameContainer.children[0];
  var x = this.rendererWidth / background.texture.baseTexture.width;
  var y = this.rendererHeight / background.texture.baseTexture.height;
  background.scale.x = x;
  background.scale.y = y;
};

Game.prototype._resizeCards = function () {
  var originalWidth = this.sprites.cards.originalWidth,
      originalHeight = this.sprites.cards.originalHeight,
      boardData = this.sprites.boardData,
      numberOfColumns = boardData.numberOfColumns,
      numberOfCards = boardData.numberOfCards,
      numberOfRows = Math.ceil(numberOfCards / numberOfColumns),
      rendererWidth = this.rendererWidth,
      rendererHeight = this.rendererHeight,
      cards = this.board.cards,
      boardContainer = this.containers.boardContainer;

  var desiredWidth, desiredHeight,
      totalCardsWidth, totalCardsHeight,
      startPositionX, startPositionY = 10,
      row = 0,
      zoomScale = 0,
      i;

  if (this.boardFitsWidth) {
    totalCardsWidth = originalWidth * numberOfColumns + 10 * (numberOfColumns + 1);
    if (totalCardsWidth <= rendererWidth) {
      startPositionX = (rendererWidth - totalCardsWidth) / 2 + 10;
      for (i = 0; i < cards.length; i++) {
        if (i % numberOfColumns === 0 && i !== 0) row++;
        positionX = startPositionX + originalWidth * (i % numberOfColumns) + 10 * (i % numberOfColumns);
        positionY = startPositionY + originalHeight * row + 10 * row;
        cards[i].setPosition(positionX, positionY);
        cards[i].setScale(1.0, 1.0);
        cards[i].cardTexture.renderedScaleX = 1.0;
        cards[i].cardTexture.renderedScaleY = 1.0;
        cards[i].cardTexture.renderedWidth = originalWidth;
        cards[i].cardTexture.renderedHeight = originalHeight;
        cards[i].cardTexture.renderedPositionX = positionX;
        cards[i].cardTexture.renderedPositionY = positionY;
      }
      boardContainer.renderedHeight = numberOfRows * (10 + originalHeight) + 10;
      this.sprites.cards.renderedWidth = originalWidth;
      this.sprites.cards.renderedHeight = originalHeight;
      this.sprites.cards.zoomScale = 1.0;
    } else {
      desiredWidth = (rendererWidth - 10 * (numberOfColumns + 1)) / 10;
      zoomScale = desiredWidth / originalWidth;
      desiredHeight = originalHeight * zoomScale;
      startPositionX = 10;
      for (i = 0; i < cards.length; i++) {
        if (i % numberOfColumns === 0 && i !== 0) row++;
        positionX = startPositionX + desiredWidth * (i % numberOfColumns) + 10 * (i % numberOfColumns);
        positionY = startPositionY + desiredHeight * row + 10 * row;
        cards[i].setPosition(positionX, positionY);
        cards[i].setScale(zoomScale, zoomScale);
        cards[i].cardTexture.renderedScaleX = zoomScale;
        cards[i].cardTexture.renderedScaleY = zoomScale;
        cards[i].cardTexture.renderedWidth = desiredWidth;
        cards[i].cardTexture.renderedHeight = desiredHeight;
        cards[i].cardTexture.renderedPositionX = positionX;
        cards[i].cardTexture.renderedPositionY = positionY;
      }
      boardContainer.renderedHeight = numberOfRows * (10 + desiredHeight) + 10;
      this.sprites.cards.renderedWidth = desiredWidth;
      this.sprites.cards.renderedHeight = desiredHeight;
      this.sprites.cards.zoomScale = zoomScale;
    }
  } else {

  }
};

Game.prototype._resizeHandContainer = function () {
  var handContainer = this.containers.handContainer,
      components = handContainer.components,
      cards = handContainer.handCards,
      componentSprites = this.sprites.components,
      cardSprites = this.sprites.cards,
      positionY = 24,
      leftStartPosition = 15,
      rightStartPosition = 15,
      handWidth = this.rendererWidth,
      handHeight = cardSprites.renderedHeight + 41,
      zoomScale = this.sprites.cards.zoomScale,
      i;


  handContainer.position.x = 0;
  handContainer.position.y = this.rendererHeight - handHeight + 1;
  components.background.width = handWidth;
  components.background._height = handHeight;
  components.textHandCards.scale.x = components.textHandCards.scale.y = zoomScale;
  components.textDeckCards.scale.x = components.textDeckCards.scale.y = zoomScale;
  components.textDiscardCards.scale.x = components.textDiscardCards.scale.y = zoomScale;
  components.deckCards.scale.x = components.deckCards.scale.y = zoomScale;
  components.discardCards.scale.x = components.discardCards.scale.y = zoomScale;
  // leftStartPosition += components.textHandCards._texture.width * zoomScale + 15;

  components.textHandCards.position.y = positionY;
  components.textDeckCards.position.y = positionY;
  components.textDiscardCards.position.y = positionY;
  components.deckCards.position.y = positionY;
  components.discardCards.position.y = positionY;

  rightStartPosition = handWidth - (rightStartPosition + components.discardCards._texture.width + components.textDiscardCards._texture.width +  components.deckCards._texture.width + components.textDeckCards._texture.width + 45) * zoomScale;

  components.textHandCards.position.x = leftStartPosition;
  leftStartPosition += (components.textHandCards._texture.width  + 15) * zoomScale;
  for (i = 0; i < cards.length; i++) {
    // console.log(cards[i]);
    cards[i].cardTexture.scale.x = zoomScale;
    cards[i].cardTexture.scale.y = zoomScale;
    cards[i].cardTexture.position.x = leftStartPosition;
    cards[i].cardTexture.renderedPositionX = cards[i].cardTexture.position.x;
    leftStartPosition += (cards[i].cardTexture._texture.width + 10) * zoomScale ;
    cards[i].cardTexture.position.y = positionY;
    cards[i].cardTexture.renderedPositionY = cards[i].cardTexture.position.y;
  }

  components.textDeckCards.position.x = rightStartPosition;
  rightStartPosition += (components.textDeckCards._texture.width + 15) * zoomScale ;
  components.deckCards.position.x = rightStartPosition;
  rightStartPosition += (components.deckCards._texture.width + 15) * zoomScale ;
  components.textDiscardCards.position.x = rightStartPosition;
  rightStartPosition += (components.textDiscardCards._texture.width + 15) * zoomScale;
  components.discardCards.position.x = rightStartPosition;
};

Game.prototype._gameReady = function () {
  var _this = this;
  var public_update_event_name = 'board_public_update';
  var user_update_event_name = 'user_hand_' + currentUserId;
  var users_are_ready_event_name = 'users_are_ready';
  this.pusherChannel.bind(public_update_event_name, function (data) {
    _this._updateBoard(data);
  });
  this.pusherChannel.bind(user_update_event_name, function (data) {
    _this._updateHand(data);
  });
  this.pusherChannel.bind(users_are_ready_event_name, function(data) {
    if (data.user_id !== currentUserId) {
      _this.boardView._createChatRoom();
      _this.boardView._endLoading();
    }
  });

  $.ajax({
    type: 'POST',
    url: '/game/ready',
    data: {
      channel_name: this.pusherChannelName,
      public_update_event_name: public_update_event_name,
      user_update_event_name: user_update_event_name,
      users_are_ready_event_name: users_are_ready_event_name,
      user_id: currentUserId,
      board_id: currentBoardId,
      game_ready: true
    },
    success: function (data) {
      console.log(data);
      if (data.all_ready) {
        _this.boardView._createChatRoom();
        _this.boardView._endLoading();
      }
    }
  });
};

Game.prototype._updateBoard = function (data) {
  console.log('Board info:= =============');
  console.log(data);
  console.log('Board info:= =============');
};

Game.prototype._updateHand = function (data) {
  console.log('Hand info:= =============');
  console.log(data);
  console.log('Hand info:= =============');
};