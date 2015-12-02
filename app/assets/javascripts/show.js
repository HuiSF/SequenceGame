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
    var chatWidget = new Board(pusher, {
      checkGameStartEndPoint: '/boards/game_start',
      chatsEndPoint: '/chats',
      sendReadyEndPoint: 'boards/ready'
    });

    function  showWatingPopup(duration) {

      // bindLeave();
    }

    function hideWaitingPopup(duration) {
      $popup = $('.waiting-popup');
      $popup.fadeOut(duration);
      $popup.delay(duration).remove();
    }

    // function bindLeave () {
    //   $('.leave').on('click', function () {
    //     $.ajax({
    //       type: 'POST',
    //       url: '/boards/leave',
    //       data: 'board_id=' + cuurentBoardId + '&user_id=' + currentUserId
    //     });
    //   });
    // }

  });
}
