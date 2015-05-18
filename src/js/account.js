// 解除绑定弹窗
$(function () {
  var form = $('form[name="unbind"]');
  form.on('submit', function (e) {
    var html = '<div class="dialog"><div class="message">确定将此账号 ' + $('input[name="account"]').val() + '<br />与微信账号解除绑定吗？</div><div class="actions"><div class="row buttons"><div class="col"><button class="button button-warning button-outline button-block">确定</button></div><div class="col"><button class="button button-default button-outline button-block">取消</button></div></div></div></div>';
    masklayer.show(html, false);

    $('.dialog button').each(function (index, button) {
      $(button).on('click', function () {
        masklayer.hide();
        if (index === 0) {
          // form[0].submit();
          // OR
          // AJAX
        }
      });
    });

    return false;
  });
});

// 绑定操作
$(function () {
  var form = $('form[name="bind"]');
  form.on('submit', function (e) {
    // AJAX callback

    var html = '<div class="dialog"><div class="message text-warning">绑定成功</div><button class="button button-warning button-outline button-only">确定</button></div>';
    masklayer.show(html, false);

    $('.dialog button').on('click', function () {
      masklayer.hide();
    });
    return false;
  });
});
