$(document).on('click', '#content .wrapper button', function () {
  var template = $('#' + $(this).attr('template')).html();
  console.log($(this).attr('template'))
  new CommonDialog({
    noheader: true,
    width: 460,
    message: Mustache.render($.trim(template), {})
  });
});