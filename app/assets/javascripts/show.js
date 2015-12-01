if ($('.boards.show').length > 0) {
  $(document).ready(function() {
    showWatingPopup(0);
    // var pusher = new Pusher('0857c097b4d9be5b3e9e');
    // var chatWidget = new Board(pusher, {
    //   chatsEndPoint: '/chats',
    //   boardsEndPoint: '/lobby'
    // });

    function  showWatingPopup(duration) {
      $popup = $('<div class="waiting-popup"></div>');
      $contentBox = $('<div class="waiting-box"><p>Hi ' + currentUser + ', we will be waiting for other players joining the game, Just a second! The game wil automatically start.</p></div>');
      $leaveBtn = $('<form action="/boards/leave?board_id=' + currentBoardId + '&user_id=' + currentUserId + '" method="post"><button type="submit" class="leave btn btn-info">Leave</button></form>');
      $contentBox.append($leaveBtn);
      $popup.append($contentBox);
      $popup.hide();
      $('body').prepend($popup);
      $popup.fadeIn(duration);
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
