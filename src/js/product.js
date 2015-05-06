$(function () {
  var offset = $('#header').height();
  var height = $('#slider').height() / $('#slider img').size();
  var buttons = $('#navButtons li');

  buttons.each(function (index, button) {
    $(button).on('click', function (e) {
      // $('#slider').css('transform', 'translate(0px, -' + index * height + 'px)');
      $('html,body').animate({
        scrollTop: offset + index * height
      });
      buttons.removeClass('active').eq(index).addClass('active');
    });
  });
});