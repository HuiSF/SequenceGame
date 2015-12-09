if ($('.boards.show').length > 0) {
  $(document).ready(function() {
    // user arrived in game view -> popup waiting window -> game_start trigger -> turn of waiting window and popup loading resource window -> when loading finish post game ready -> back end write game ready status into database, and also check how many users are in ready status -> if all users are ready -> push initial game data -> turn of loading resource window
    // post to boards#game_star to call further pusher event
    // create pusher channel
    // bind events, waiting for game start trigger
    // bind game_start_event
    // if game starts, create new game
    //
    var pusher = new Pusher('0857c097b4d9be5b3e9e');
    var board = new Board(pusher, {
      checkBoardFull: '/game/board_full',
      chatsEndPoint: '/chats',
      sendReadyEndPoint: 'game/ready'
    });
    //
    // function  showWatingPopup(duration) {
    //
    //   // bindLeave();
    // }
    //
    // function hideWaitingPopup(duration) {
    //   $popup = $('.waiting-popup');
    //   $popup.fadeOut(duration);
    //   $popup.delay(duration).remove();
    // }

    // function bindLeave () {
    //   $('.leave').on('click', function () {
    //     $.ajax({
    //       type: 'POST',
    //       url: '/boards/leave',
    //       data: 'board_id=' + cuurentBoardId + '&user_id=' + currentUserId
    //     });
    //   });
    // }
      var $window = $(window);
      var isPanelShown = false;

      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    		$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', '/css/mobile.css'));
        $('.side-panel').removeClass('col-sm-5').addClass('col-sm-12');
        // console.log('load css for mobile');
    	}

      resizeSidePanel();

      $(window).resize(function () {
        var $window = $(window);
        var $gameView = $('#game-view');
        $gameView.height($window.innerHeight());
        if (board._game) {
          board._game._resize($gameView.innerWidth(), $gameView.innerHeight());
        }
        resizeSidePanel();
        resizeGameChatRoom();
        if ($window.width() <= 980) {
          showPanelGrabber();
          hidePanel();
        } else {
          hidePanelGrabber();
          showPanel();
        }
      });

      $('.panel-grabber').on('click tap', function () {
        var offset = $('.side-panel').outerWidth();
        resizeSidePanel();
        if (isPanelShown) {
          hidePanelAnimate();
          // $(this).animate({'right': 0}, 500);
          isPanelShown = false;
        } else {
          showPanelAnimate();
          // $(this).animate({'right': (offset - 20)}, 500);
          isPanelShown = true;
        }
      });

      if ($window.width() <= 980) {
        showPanelGrabber();
        hidePanel();
      } else {
        hidePanelGrabber();
        showPanel();
      }

      function resizeSidePanel () {
        $('.side-panel').height($(window).innerHeight());
        $('.chat-room').height($('.side-panel').innerHeight() - $('.user-list').outerHeight());
      }

      function showPanelGrabber() {
        console.log('show grabber');
        $grabber = $('.panel-grabber');
        $grabber.removeClass('hidden');
        $grabber.css('right', 0);
      }

      function hidePanelGrabber() {
        console.log('hide grabber');
        $grabber = $('.panel-grabber');
        $grabber.addClass('hidden');
        $grabber.css('right', 0);
      }

      function showPanelAnimate() {
        $gamePanel = $('.game-panel');
        $sidePanel = $('.side-panel');
        var offset = $panel.outerWidth();
        $gamePanel.animate({'left': (0 - offset)}, 500);
        $sidePanel.animate({'right': 0}, 500);
      }

      function hidePanelAnimate() {
        $panel = $('.side-panel');
        var offset = $panel.outerWidth();
        $gamePanel.animate({'left': 0}, 500);
        $panel.animate({'right': (0 - offset)}, 500);
      }

      function showPanel() {
        console.log('show panel');
        $panel = $('.side-panel');
        $panel.css('right', 0);
      }
      function hidePanel() {
        console.log('hide panel');
        $panel = $('.side-panel');
        offset = 0 - $panel.outerWidth();
        $panel.css({
          'right': offset,
          'position': 'absolute',
          'float': 'none'
        });
      }
  });
}
