if ($('.boards.index').length > 0) {
  $(document).ready(function() {
    // showPopup(0);
    // create pusher instance
    // AJAX call for initial data
    // processing data and generate lists
    // initialize UI
    var pusher = new Pusher('0857c097b4d9be5b3e9e');
    var chatWidget = new Lobby(pusher, {
      chatsEndPoint: '/chats',
      boardsEndPoint: '/lobby/boards'
    });
    resizeLobbyChatRoom();
    resizeAvatar();

    var tabs = [], tab, panels = [];
    tabs.push($('.two-players-tab'));
    tabs.push($('.three-players-tab'));
    tabs.push($('.four-players-tab'));
    panels.push($('.two-players-boards'));
    panels.push($('.three-players-boards'));
    panels.push($('.four-players-boards'));

    // bind click events to each tab
    tabs.forEach(function (tab) {
      tab.on('click', function (e) {
        e.preventDefault();
        switchTabs(this, panels);
      });
    });

    // initialize panels
    switchTabs(tabs[0], panels);

    $window.resize(function() {
      resizeLobbyChatRoom();
      resizeAvatar();
    });

    function resizeAvatar() {
      var tableContainerWidth = $('.table-container').innerWidth(),
        tableStatusWidth = $('.table-number').outerWidth(),
        seatsWidth = (tableContainerWidth - tableStatusWidth - 72) / 4;
      $('.seats').each(function() {
        $(this).width(seatsWidth).height(seatsWidth);
      });
    }

    function switchTabs(tab, panels) {
      var $tab = $(tab),
          tabPanel = $tab.data('panel'),
          $previousTab = $('li.active');
      panels.forEach(function (panel) {
        if ($(panel).hasClass(tabPanel)) {
          $(panel).fadeIn(300);
          $previousTab.removeClass('active');
          $tab.addClass('active');
        } else {
          $(panel).hide();
        }
      });
    }
  });
}
