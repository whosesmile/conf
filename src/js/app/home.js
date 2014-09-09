$(function () {
  $('.list-actions li.settings').click(function () {
    if (!$(this).is('.disabled')) {
      $(this).toggleClass('active');
    }
  });
});