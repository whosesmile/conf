$(function () {
  $('.tabview .tab').on('click', function (e) {
    var tab = $(this);
    var name = tab.data('view');
    tab.addClass('active').siblings('.tab').removeClass('active');
    $('.tabview .view.' + name).addClass('active').siblings('.view').removeClass('active');
    return false;
  });
});