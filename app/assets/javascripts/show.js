if ($('.boards.show').length > 0) {
  $(document).ready(function() {
    showWatingPopup(0);
    var pusher = new Pusher('0857c097b4d9be5b3e9e');
    var chatWidget = new Lobby(pusher, {
      chatsEndPoint: '/chats',
      boardsEndPoint: '/lobby'
    });

    function  showWatingPopup(duration) {
      $popup = $('<div class="waiting-popup"></div>');
      $contentBox = $('<div class="waiting-content"><p>Hi ' + currentUser + ', we are waiting for other players joining the game, Just a second!</p></div>');
      $userList = $('<div class="waiting-user-list col-sm-12"><div>');
      $popup.append($contentBox);
      $popup.hide();
      $('body').prepend($popup);
      $popup.fadeIn(duration);
    }

    function hideWaitingPopup(duration) {
      $popup = $('.waiting-popup');
      $popup.fadeOut(duration);
      $popup.delay(duration).remove();
    }
  });
}
