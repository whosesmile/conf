$(function () {
  $('#join').on('click', function (e) {
    var html = '<div class="cornertips"><i class="icon icon-arrow-corner"></i><span>请点击右上角按钮，<br />选择浏览器打开，否则无法进入会议！</span><i class="icon icon-pointer"></i></div>';
    masklayer.show(html);
    return false;
  });
});
