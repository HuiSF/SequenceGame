if ($('.registrations').length > 0) {
  $(document).ready(function() {
    var avatarPickers = $('.avatar'),
        $avatarPathInput = $('input[name="avatar"]');
    $.each(avatarPickers, function (key, avatar) {
      $(avatar).on('click', function () {
        $('.avatar.selected').removeClass('selected');
        $(this).addClass('selected');
        avatarPath = $(this).data('avatar-path');
        $avatarPathInput.val(avatarPath);
      });
    });
  });
}
