// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
// require jquery
// require pusher.min.js
// require jquery_ujs
// require turbolinks
//= require_tree .
$(document).ready(function() {

});

function resizeLobbyChatRoom() {
  $window = $(window);
  $chatContainer = $('.chat-container');
  $chatContainer.height($window.innerHeight());
}

function resizeGameChatRoom() {
  // console.log('resizing chat room');
  $window = $(window);
  $chatContainer = $('.chat-container');
  $userList = $('.user-list');
  $gameButtons = $('.game-buttons');
  $turnReminder = $('.turn-reminder');
  $chatWidget = $('.pusher-chat-widget');
  $pusherChatWidgetInput = $('.pusher-chat-widget-input');
  $pusherChatWidgetMessages = $('.pusher-chat-widget-messages');
  $chatContainer.height($window.innerHeight() - $userList.outerHeight() - $gameButtons.outerHeight() - $turnReminder.outerHeight());
  // $chatWidget.height($window.innerHeight() - $userList.outerHeight() - $gameButtons.outerHeight() - $turnReminder.outerHeight());
  // $pusherChatWidgetMessages.height($window.innerHeight() - $userList.outerHeight() - $gameButtons.outerHeight() - $turnReminder.outerHeight() - $pusherChatWidgetInput.outerHeight());
  $('.activity-stream').css('max-height', $window.innerHeight() - $userList.outerHeight() - $gameButtons.outerHeight() - $turnReminder.outerHeight() - $pusherChatWidgetInput.outerHeight() - 5);
}

function  showPopup(duration) {
  $popup = $('<div class="loading-popup"><div class="loading-box"><span class="glyphicon glyphicon-refresh"></span>&nbsp;<span class="loading-text">Loading resources...</span></div></div>');
  $popup.hide();
  $('body').prepend($popup);
  $popup.fadeIn(duration);
}

function hidePopup(duration) {
  $popup = $('.loading-popup');
  $popup.fadeOut(duration);
  $popup.delay(duration).remove();
}
