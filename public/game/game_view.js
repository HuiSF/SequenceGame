$(document).ready(function () {
  'use strick';
  var shadow = new PIXI.filters.DropShadowFilter();
  shadow.blur = 10;
  shadow.alpha = 0.5;
  shadow.distance = 0.5;
  shadow.angle = 0;

  var Game = function () {
    this.game_id = '';
    renderOptions = {
      "autoResize": true,
      "resolution": 1,
    };
    this.initialize(renderOptions);
  };

  Game.prototype = {
    constructor: Game,
    initialize: function (renderOptions) {
      this.$window = $(window);
      this.$gameView = $('#game-view');
      this.rendererWidth = this.$gameView.innerWidth();
      this.rendererHeight = this.$window.innerHeight();
      this.renderer = new PIXI.WebGLRenderer(this.rendererWidth, this.rendererHeight, renderOptions);
      this.rendererView = this.renderer.view;
      this.$rendererView = $(this.rendererView);

      this.start();
    },
    resize: function(width, height) {
      this.rendererWidth = width;
      this.rendererHeight = height;
      this.renderer.resize(width, height);
      this.gameContainer.resizeBackground(width, height);
      this.boardContianer.resizeCards();
      // this.handContianer.resize();
    },
    loadSprites: function () {
      var INSTANCE = this;
      PIXI.loader
        .add('cards', 'images/cards.json')
        .add('components', 'images/components.json')
        .load(function (loader, resources) {
          INSTANCE.cardSprites = resources.cards.textures;
          INSTANCE.componentSprites = resources.components.textures;
          INSTANCE.initializeBoard();
          INSTANCE.boardContianer.resizeCards();
          INSTANCE.initializeHandContainer();
          INSTANCE.addCanvas();
          // console.log(INSTANCE);
        });
    },
    initializeGameContainer: function () {
      var INSTANCE = this;
      this.gameContainer = new PIXI.Container();
      this.gameContainer.interactive = true;
      var desiredWidth = this.rendererWidth;
      var desiredHeight = this.rendererHeight;
      var background = new PIXI.Sprite(new PIXI.Texture.fromImage('images/game-bg.jpg'));

      // add a resize function to game container
      this.gameContainer.resizeBackground = function (desiredWidth, desiredHeight) {
        var background = INSTANCE.gameContainer.children[0];
        // for the first time load in image
        background.texture.baseTexture.on('loaded', function() {
          var x = desiredWidth / background.texture.baseTexture.width;
          var y = desiredHeight / background.texture.baseTexture.height;
          background.scale.x = x;
          background.scale.y = y;
        });
        // after image loaded in
        var x = desiredWidth / background.texture.baseTexture.width;
        var y = desiredHeight / background.texture.baseTexture.height;
        background.scale.x = x;
        background.scale.y = y;
        // console.log(background);
      };

      this.gameContainer.addChild(background);
      this.gameContainer.resizeBackground(this.rendererWidth, this.rendererHeight);
    },
    initializeBoard: function () {
      console.log('Ready to read board data');
      this.boardContianer = new PIXI.Container();
      this.boardContianer.interactive = true;
      this.boardContianer.fitWidth = true;
      this.boardContianer.filters = [shadow];
      this.board = {};
      this.board.cards = [];
      var INSTANCE = this;

      var Deferred =  $.getJSON('data/board_data.json')
        .always(function(data) {
        console.log("Reading board data completed!");
        generateCards(data);
        return $.Deferred().resolve();
      });

      function generateCards(cardsData) {
        var numberOfCards = INSTANCE.board.numberOfCards = cardsData.numberOfCards;
        var numberOfColumns = INSTANCE.board.numberOfColumns = cardsData.numberOfColumns;
        var numberOfRows = INSTANCE.board.numberOfRows = Math.ceil(cardsData.numberOfCards / cardsData.numberOfColumns);
        var i, aCard;

        console.log('Will generate ' + numberOfCards + ' cards.');
        console.log(numberOfColumns + ' cards per row.');

        for (i = 1; i <= 100; i++) {
          aCard = new Card(i, cardsData[i].suit, cardsData[i].rank);
          aCard.loadTexture(INSTANCE.cardSprites);
          INSTANCE.board.cards.push(aCard);
          INSTANCE.boardContianer.addChild(aCard.cardTexture);
        }
        INSTANCE.boardContianer.resizeCards();
        INSTANCE.boardContianer.bindEvents();
      }

      this.boardContianer.resizeCards = function () {
        var originalWidth = INSTANCE.cardSprites['back.png'].width,
            originalHeight = INSTANCE.cardSprites['back.png'].height,
            desiredWidth, desiredHeight,
            totalWidth, totalHeight,
            positionX, positionY,
            startPositionX, startPositionY = 10,
            scaleX, scaleY,
            numberOfColumns = INSTANCE.board.numberOfColumns,
            numberOfRows = INSTANCE.board.numberOfRows,
            cards = INSTANCE.board.cards,
            boardContianer = INSTANCE.boardContianer,
            rendererWidth = INSTANCE.rendererWidth,
            rendererHeight = INSTANCE.rendererHeight,
            row = 0,
            i;
        if (boardContianer.fitWidth) {
          totalWidth = 10 * (numberOfColumns + 1) + originalWidth * numberOfColumns;
          if (totalWidth <= rendererWidth) {
            startPositionX = (rendererWidth - totalWidth) / 2 + 10;
            for (i = 0; i < cards.length; i++) {
              if (i % numberOfColumns === 0 && i !== 0) row++;
              positionX = startPositionX + originalWidth * (i % numberOfColumns) + 10 * (i % numberOfColumns);
              positionY = startPositionY + originalHeight * row + 10 * row;
              cards[i].setPosition(positionX, positionY);
              cards[i].cardTexture.scaleX = 1.0;
              cards[i].cardTexture.scaleY = 1.0;
              cards[i].cardTexture.renderedWidth = originalWidth;
              cards[i].cardTexture.renderedHeight = originalHeight;
              cards[i].cardTexture.renderedPositionX = positionX;
              cards[i].cardTexture.renderedPositionY = positionY;
            }
            boardContianer.renderedHeight = numberOfRows * (10 + originalHeight) + 10;
          } else {
            desiredWidth = (rendererWidth - 10 * (numberOfColumns + 1)) / 10;
            scaleX = scaleY = desiredWidth / originalWidth;
            desiredHeight = originalHeight * scaleY;
            startPositionX = 10;
            for (i = 0; i < cards.length; i++) {
              if (i % numberOfColumns === 0 && i !== 0) row++;
              positionX = startPositionX + desiredWidth * (i % numberOfColumns) + 10 * (i % numberOfColumns);
              positionY = startPositionY + desiredHeight * row + 10 * row;
              cards[i].setPosition(positionX, positionY);
              cards[i].resize(scaleX, scaleY);
              cards[i].cardTexture.scaleX = scaleX;
              cards[i].cardTexture.scaleY = scaleY;
              cards[i].cardTexture.renderedWidth = desiredWidth;
              cards[i].cardTexture.renderedHeight = desiredHeight;
              cards[i].cardTexture.renderedPositionX = positionX;
              cards[i].cardTexture.renderedPositionY = positionY;
            }
            boardContianer.renderedHeight = numberOfRows * (10 + desiredHeight) + 10;
          }
        } else {
          totalHeight = 10 * (numberOfRows + 1) + originalHeight * numberOfRows;
          if (totalHeight >= rendererHeight - 100) {
            desiredHeight = (rendererHeight - 100 - (numberOfRows + 1) * 10) / numberOfRows;
            scaleY = desiredHeight / originalHeight;
            desiredWidth = originalWidth * scaleY;
            scaleX = scaleY;
            totalWidth = 10 * (numberOfColumns + 1) + desiredWidth * numberOfColumns;
            for (i = 0; i < cards.length; i++) {
              cards[i].resize(scaleX, scaleY);
            }
            startPositionX = (rendererWidth - totalWidth) / 2 + 10;
            for (i = 0; i < cards.length; i++) {
              if (i % 10 === 0 && i !== 0) row++;
              positionX = startPositionX + desiredWidth * (i % numberOfColumns) + 10 * (i % numberOfColumns);
              positionY = startPositionY + desiredHeight * row + 10 * row;
              cards[i].setPosition(positionX, positionY);
              cards[i].cardTexture.scaleX = scaleX;
              cards[i].cardTexture.scaleY = scaleY;
              cards[i].cardTexture.renderedWidth = desiredWidth;
              cards[i].cardTexture.renderedHeight = desiredHeight;
              cards[i].cardTexture.renderedPositionX = positionX;
              cards[i].cardTexture.renderedPositionY = positionY;
            }
            boardContianer.renderedHeight = numberOfRows * (10 + desiredHeight) + 10;
          }
        }
      };

      this.boardContianer.bindEvents = function () {
        var boardContainer = this;
        INSTANCE.$gameView.on('mousewheel', function (e) {
          var upLimit = 0 - (boardContainer.renderedHeight - INSTANCE.rendererHeight + 140);
          var downLimit = -14;
          if (e.deltaY < 0 && boardContainer.position.y >= upLimit) {
            boardContainer.position.y -= 14;
          } else if (e.deltaY > 0 && boardContainer.position.y <= downLimit) {
            boardContainer.position.y += 14;
          }
        });
      };

      return Deferred;
    },
    initializeHandContainer: function () {
      // console.log(this);
      var INSTANCE = this;
      console.log(this.board.cards['0']);
      // var scale = INSTANCE.cardScale;
      // console.log(scale);
      // var height = scale * 115 + 41 * scale;
      // console.log(height);
      this.handContianer = new PIXI.Container();
      this.handContianer.position.x = 0;
      this.handContianer.position.y = this.rendererHeight - 155;

      console.log(this.handContianer);
      this.handContianer.resize = function () {
        var zoomScale = INSTANCE.rendererWidth / 1025,
            positionY = INSTANCE.rendererHeight - 155 * zoomScale;
        INSTANCE.handContianer.scale.x = zoomScale;
        INSTANCE.handContianer.scale.y = zoomScale;
      };

      initializeBackround();
      placeTexts();
      this.handContianer.resize();

      function initializeBackround() {
        var handBackground = new PIXI.extras.TilingSprite(INSTANCE.componentSprites['hand-background.png'], 1025, 156);
        INSTANCE.handContianer.addChild(handBackground);
      }

      function placeTexts() {
        var textHandCards = new PIXI.Sprite(INSTANCE.componentSprites['text-hand-cards.png']),
            textDeckCards = new PIXI.Sprite(INSTANCE.componentSprites['text-deck-cards.png']),
            textDiscardCards = new PIXI.Sprite(INSTANCE.componentSprites['text-discard-cards.png']);

        textHandCards.position.x = 15;
        textHandCards.position.y = 25;
        textDeckCards.position.x = 685;
        textDeckCards.position.y = 25;
        textDiscardCards.position.x = 840;
        textDiscardCards.position.y = 25;
        INSTANCE.handContianer.addChild(textHandCards);
        INSTANCE.handContianer.addChild(textDeckCards);
        INSTANCE.handContianer.addChild(textDiscardCards);
      }

    },
    addCanvas: function () {
      this.gameContainer.addChild(this.boardContianer);
      this.gameContainer.addChild(this.handContianer);
      this.handContianer.interactive = true;
      this.$rendererView.addClass('game-canvas');
      this.$gameView.append(this.$rendererView).height(this.$window.innerHeight());
    },
    start: function () {
      var INSTANCE = this;
      this.initializeGameContainer();
      this.loadSprites();
      animate();
      function animate() {
        requestAnimationFrame(animate);
        INSTANCE.renderer.render(INSTANCE.gameContainer);
      }
    }
  };

  // initializeViews();
  var game = new Game();

  function initializeViews() {
    var $window = $(window);
    var $gameView = $('#game-view');
    $gameView.height($window.innerHeight());
  }

  $(window).resize(function () {
    var $window = $(window);
    var $gameView = $('#game-view');
    $gameView.height($window.innerHeight());
    game.resize($gameView.innerWidth(), $gameView.innerHeight());
  });
});
