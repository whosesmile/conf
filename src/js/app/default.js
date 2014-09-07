$(function () {
  $('#lside .list>li').click(function (e) {
    $(this).toggleClass('active').siblings().removeClass('active');
    return false;
  });

  $('#lside .list>li>ul>li').click(function (e) {
    $(this).toggleClass('active').siblings().removeClass('active');
    return false;
  });
});