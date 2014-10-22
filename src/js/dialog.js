$(document).on('click', '#content .wrapper button', function () {
  var template = $(this).attr('template');
  $.when(Toolkit.loadTempl('/assets/works/dialogs/' + template)).done(function (template) {
    new CommonDialog({
      noheader: true,
      width: 500,
      message: Mustache.render(template, {})
    });
  });
});