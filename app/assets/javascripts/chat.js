$(function() {
  var pusher = new Pusher('0857c097b4d9be5b3e9e');
  var chatWidget = new PusherChatWidget(pusher, {
    chatEndPoint: '/chats'
  });
});
