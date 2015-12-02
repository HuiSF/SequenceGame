// $(document).ready(function () {
//   var game = new Game();
//   var $window = $(window);
//   var isPanelShown = false;
//   console.log(game);
//   // $('.container-fluid').width($window.innerWidth());
//
//   if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
// 		$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', 'css/sequence-mobile.css'));
//     $('.side-panel').removeClass('col-sm-5').addClass('col-sm-12');
//     console.log('load css for mobile');
// 	}
//
//   resizeSidePanel();
//
//   $(window).resize(function () {
//     var $window = $(window);
//     var $gameView = $('#game-view');
//     $gameView.height($window.innerHeight());
//     game._resize($gameView.innerWidth(), $gameView.innerHeight());
//     resizeSidePanel();
//     if ($window.width() <= 980) {
//       showPanelGrabber();
//       hidePanel();
//     } else {
//       hidePanelGrabber();
//       showPanel();
//     }
//   });
//
//   $('.panel-grabber').on('click tap', function () {
//     var offset = $('.side-panel').outerWidth();
//     resizeSidePanel();
//     if (isPanelShown) {
//       hidePanelAnimate();
//       // $(this).animate({'right': 0}, 500);
//       isPanelShown = false;
//     } else {
//       showPanelAnimate();
//       // $(this).animate({'right': (offset - 20)}, 500);
//       isPanelShown = true;
//     }
//   });
//
//   if ($window.width() <= 980) {
//     showPanelGrabber();
//     hidePanel();
//   } else {
//     hidePanelGrabber();
//     showPanel();
//   }
//
//   function resizeSidePanel () {
//     $('.side-panel').height($(window).innerHeight());
//     $('.chat-room').height($('.side-panel').innerHeight() - $('.user-list').outerHeight());
//   }
//
//   function showPanelGrabber() {
//     $grabber = $('.panel-grabber');
//     $grabber.removeClass('hidden');
//     $grabber.css('right', 0);
//   }
//
//   function hidePanelGrabber() {
//     $grabber = $('.panel-grabber');
//     $grabber.addClass('hidden');
//     $grabber.css('right', 0);
//   }
//
//   function showPanelAnimate() {
//     $gamePanel = $('.game-panel');
//     $sidePanel = $('.side-panel');
//     var offset = $panel.outerWidth();
//     $gamePanel.animate({'left': (0 - offset)}, 500);
//     $sidePanel.animate({'right': 0}, 500);
//   }
//
//   function hidePanelAnimate() {
//     $panel = $('.side-panel');
//     var offset = $panel.outerWidth();
//     $gamePanel.animate({'left': 0}, 500);
//     $panel.animate({'right': (0 - offset)}, 500);
//   }
//
//   function showPanel() {
//     console.log('calling');
//     $panel = $('.side-panel');
//     $panel.css('right', 0);
//   }
//   function hidePanel() {
//     console.log('calling');
//     $panel = $('.side-panel');
//     $offset = $panel.outerWidth();
//     $panel.css('right', (0 - $offset));
//   }
// });
