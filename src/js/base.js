/**
 * 根据屏幕宽度适配字体大小
 */
$(window).on('resize', function () {
  var width = Math.min(document.documentElement.clientWidth, 640);
  $('html').css('font-size', (width / 640 * 32) + 'px');
}).triggerHandler('resize');

// 加载完成后重新计算一次
$(function () {
  $(window).triggerHandler('resize');
});

/**
 * 消息浮层
 */
(function () {
  var timer = null;
  var lasted = 4000;
  var instance = null;

  var notice = window.notice = function (message, type) {
    if (instance === null) {
      instance = $('<div class="js-notice" />').appendTo('body');
    }
    type = type || 'normal';
    instance.removeClass('overdue').html('<span class="' + type + '">' + message + '</span>');
    clearTimeout(timer);
    timer = setTimeout(function () {
      instance.addClass('overdue');
    }, lasted);
  };

  // 添加快捷方式
  ['success', 'warning', 'failure'].forEach(function (name) {
    notice[name] = function (message) {
      notice(message, name);
    };
  });
})();

/**
 * 下拉菜单
 */
$(function () {
  $('.dropdown .toggle').on('click', function (e) {
    $(this).parents('.dropdown').eq(0).find('.menubar').toggle();
    e.stopPropagation();
  });
  $('.dropdown .menubar').on('click', function (e) {
    setTimeout(function () {
      $(this).hide();
    }.bind(this), 0);
    e.stopPropagation();
  });
  $(document).on('click', function () {
    $('.dropdown .menubar').hide();
  });
});

// 下载APP
$(function () {
  var panel = $('#appstore');
  var section = $('section').eq(0);
  var handler = panel.find('.handler');
  handler.on('click', function () {
    if (handler.is('.icon-dir-down')) {
      handler.removeClass('icon-dir-down').addClass('icon-dir-up');
      panel.removeClass('open').addClass('fold');
    }
    else {
      handler.removeClass('icon-dir-up').addClass('icon-dir-down');
      panel.removeClass('fold').addClass('open');
    }
  });

  if (panel.length) {
    section.addClass('has-appstore');
  }
});

// masklayer
(function (global) {
  var instance = null;

  global.masklayer = {
    show: function (html) {
      this.getInstance(html).show();
    },
    hide: function () {
      this.getInstance().hide();
    },
    getInstance: function (html) {
      if (!instance) {
        instance = $('<div id="masklayer" />').appendTo('body');
        instance.on('click', function () {
          this.hide();
        }.bind(this));
      }
      instance.html(html || '');
      return instance;
    }
  };
})(window);
