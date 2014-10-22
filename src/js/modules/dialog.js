/*global Mustache, AlertDialog, ConfirmDialog, CommonDialog  */

// jQuery(document).on('click', '#content .wrapper button', function () {
//   jQuery.when(Toolkit.loadTempl('/assets/works/dialogs/test.html')).done(function (template) {
//     new CommonDialog({
//       noheader: true,
//       width: 500,
//       message: Mustache.render(template, {})
//     });
//   });
// });

jQuery(document).on('click', '#content .wrapper button', function () {
  var obj = jQuery(this),
    name = obj.dataset('name');

  // 默认的缺省Loading弹窗
  if (name === 'loading') {
    return new CommonDialog({
      width: 450,
      noheader: true
    });
  }

  // 计算弹窗模板地址
  // 规则：{{name}}.template.html
  var url = Mustache.render('/assets/js/partials/{{name}}.template.html', {
    name: name
  });

  // 请求模板 弹出弹窗
  jQuery.when(Toolkit.loadTempl(url)).done(function (template) {
    var dialog = null,
      data = {};
    if (obj.dataset('domain')) {
      data[name + obj.dataset('domain')] = true;
    }
    else {
      data[name] = true;
    }

    if (name === 'login') {
      dialog = new CommonDialog({
        noheader: true,
        width: 500,
        classes: 'login-dialog',
        message: Mustache.render(template, data)
      });

      dialog.find('.brand .close').click(function () {
        dialog.hide();
      });
    }
    else if (name === 'notice') {
      dialog = new AlertDialog({
        width: 600,
        classes: 'notice-dialog',
        title: '<i class="icon icon-notice"></i>公告通知',
        message: Mustache.render(template, data)
      });
      dialog.getFooter().prepend('<div class="remember"><input type="checkbox" id="noticeRemember" /> <label for="noticeRemember">不再弹出此条公告提醒</label></div>');
    }
    else if (name === 'party') {
      new AlertDialog({
        width: 700,
        classes: 'party-dialog',
        title: '<i class="icon icon-party"></i>参会详情',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'joinbynumber') {
      new AlertDialog({
        width: 450,
        classes: 'joinbynumber-dialog',
        title: '<i class="icon icon-numjoin"></i>会议号加入',
        confirmText: '立即加入',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'intime') {
      new AlertDialog({
        width: 450,
        classes: 'intime-dialog',
        title: '<i class="icon icon-join"></i>即时会议',
        confirmText: '立即开始',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'import') {
      if (obj.dataset('domain')) {
        new AlertDialog({
          width: 700,
          classes: 'import-dialog',
          title: '<i class="icon icon-import"></i>批量添加联系人',
          message: Mustache.render(template, data)
        });
      }
      else {
        new ConfirmDialog({
          width: 700,
          classes: 'import-dialog',
          title: '<i class="icon icon-import"></i>批量添加联系人',
          message: Mustache.render(template, data)
        });
      }
    }
    else if (name === 'prompt') {
      new ConfirmDialog({
        width: 450,
        classes: 'prompt-dialog',
        title: '<i class="icon icon-prompt"></i>提醒',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'adduser') {
      new ConfirmDialog({
        width: 600,
        classes: 'adduser-dialog',
        title: '<i class="icon icon-add"></i>添加联系人',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'invite') {
      if (obj.dataset('domain') === 'blank') {
        new AlertDialog({
          width: 700,
          classes: 'invite-dialog',
          title: '<i class="icon icon-invite"></i>邀请人列表',
          message: Mustache.render(template, data)
        });
      }
      else if (obj.dataset('domain') === 'adduser') {
        new ConfirmDialog({
          width: 700,
          classes: 'invite-dialog',
          title: '<i class="icon icon-invite"></i>邀请人列表',
          confirmText: '发送',
          message: Mustache.render(template, data)
        });
      }
      else if (obj.dataset('domain') === 'success') {
        new AlertDialog({
          width: 700,
          classes: 'invite-dialog',
          title: '<i class="icon icon-invite"></i>邀请与会者',
          message: Mustache.render(template, data)
        });
      }
      else if (obj.dataset('domain') === 'concat') {
        new AlertDialog({
          width: 700,
          classes: 'invite-dialog',
          title: '<i class="icon icon-invite"></i>从通信录选择',
          message: Mustache.render(template, data)
        });
      }
      else if (obj.dataset('domain') === 'failure') {
        new AlertDialog({
          width: 700,
          classes: 'invite-dialog',
          title: '<i class="icon icon-invite"></i>邀请与会者',
          message: Mustache.render(template, data)
        });
      }
      else {
        new ConfirmDialog({
          width: 700,
          classes: 'invite-dialog',
          title: '<i class="icon icon-invite"></i>邀请人列表',
          confirmText: '提醒与会者',
          message: Mustache.render(template, data)
        });
      }
    }
    else if (name === 'meeting') {
      if (obj.dataset('domain') === 'firststep') {
        dialog = new ConfirmDialog({
          width: 700,
          classes: 'meeting-dialog',
          title: '<i class="icon icon-meeting"></i>预约会议<span class="step"><ul class="numbers"><li class="active">1</li><li>2</li><li>3</li><li>4</li></ul><ul class="desc"><li>会议信息</li><li>时间信息</li><li>参数信息</li><li>完成</li></ul></span>',
          confirmText: '下一步',
          message: Mustache.render(template, data)
        });
      }
      else if (obj.dataset('domain') === 'secondstep' || obj.dataset('domain') === 'secondstep2') {
        dialog = new ConfirmDialog({
          width: 700,
          classes: 'meeting-dialog',
          title: '<i class="icon icon-meeting"></i>预约会议<span class="step"><ul class="numbers"><li class="active">1</li><li class="active">2</li><li>3</li><li>4</li></ul><ul class="desc"><li>会议信息</li><li>时间信息</li><li>参数信息</li><li>完成</li></ul></span>',
          confirmText: '下一步',
          message: Mustache.render(template, data)
        });
        dialog.addButton({
          text: '上一步',
          clazz: 'button input-gray prev-button',
          prepend: true,
          callback: function () {
            // 
          }
        });
      }
      else if (obj.dataset('domain') === 'thirdstep') {
        dialog = new CommonDialog({
          width: 700,
          classes: 'meeting-dialog',
          title: '<i class="icon icon-meeting"></i>预约会议<span class="step"><ul class="numbers"><li class="active">1</li><li class="active">2</li><li class="active">3</li><li>4</li></ul><ul class="desc"><li>会议信息</li><li>时间信息</li><li>参数信息</li><li>完成</li></ul></span>',
          message: Mustache.render(template, data)
        });
      }
      else if (obj.dataset('domain') === 'thirdstep2') {
        dialog = new ConfirmDialog({
          width: 700,
          classes: 'meeting-dialog',
          title: '<i class="icon icon-meeting"></i>预约会议<span class="step"><ul class="numbers"><li class="active">1</li><li class="active">2</li><li class="active">3</li><li>4</li></ul><ul class="desc"><li>会议信息</li><li>时间信息</li><li>参数信息</li><li>完成</li></ul></span>',
          confirmText: '完成',
          message: Mustache.render(template, data)
        });
        dialog.addButton({
          text: '上一步',
          clazz: 'button input-gray prev-button',
          prepend: true,
          callback: function () {
            // 
          }
        });
      }
      else if (obj.dataset('domain') === 'fourthstep') {
        dialog = new AlertDialog({
          width: 700,
          classes: 'meeting-dialog',
          title: '<i class="icon icon-meeting"></i>预约会议<span class="step"><ul class="numbers"><li class="active">1</li><li class="active">2</li><li class="active">3</li><li class="active">4</li></ul><ul class="desc"><li>会议信息</li><li>时间信息</li><li>参数信息</li><li>完成</li></ul></span>',
          message: Mustache.render(template, data)
        });
      }
    }
    else if (name === 'order') {
      new AlertDialog({
        width: 700,
        classes: 'order-dialog',
        title: '<i class="icon icon-order"></i>账单详情',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'participate') {
      new CommonDialog({
        width: 450,
        classes: 'participate-dialog',
        title: '<i class="icon icon-join"></i>加入会议',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'choose') {
      new ConfirmDialog({
        width: 700,
        classes: 'choose-dialog',
        title: '<i class="icon icon-import"></i>从通讯录中选择',
        confirmText: '选定',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'details') {
      new ConfirmDialog({
        width: 700,
        classes: 'details-dialog',
        title: '<i class="icon icon-import"></i>会议详情',
        confirmText: '会议详情',
        message: Mustache.render(template, data)
      });
    }
    else if (name === 'modifypwd') {
      if (obj.dataset('domain') === 'success') {
        new AlertDialog({
          width: 450,
          classes: 'modifypwd-dialog',
          title: '<i class="icon icon-modifypwd"></i>修改密码',
          message: Mustache.render(template, data)
        });
      }
      else {
        new ConfirmDialog({
          width: 450,
          classes: 'modifypwd-dialog',
          title: '<i class="icon icon-modifypwd"></i>修改密码',
          message: Mustache.render(template, data)
        });
      }
    }
  });
});