$(function () {
  $('#lside .list li').click(function (e) {
    $(this).toggleClass('active').siblings().removeClass('active');
    var href = $(this).children('a').attr('href');
    if (href) {
      $('iframe[name="mainframe"]').attr('src', href);
    }
    return false;
  });
});