$(function () {
  var offset = $('#header').height();
  var buttons = $('#navButtons li');
  buttons.each(function (index, button) {
    $(button).on('click', function (e) {
      $('html,body').animate({
        scrollTop: offset + index * $('#slider').height() / $('#slider img').size()
      });
      buttons.removeClass('active').eq(index).addClass('active');
    });
  });
});