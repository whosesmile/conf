$(function () {
  $('.list-actions li.settings').on('click', function (e) {
    if (!$(this).is('.disabled')) {
      $(this).toggleClass('active');
    }
    e.stopPropagation();
  });

  $('.list-actions li.settings .options').on('click', function (e) {
    e.stopPropagation();
  });

  $('.list-actions li.settings .options .btn').click(function (e) {
    $(this).closest('li').removeClass('active');
    e.stopPropagation();
  });

  $(document).on('click', function () {
    $('.list-actions li.settings').removeClass('active');
  });
});