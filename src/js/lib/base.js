// 全局添加一些正则
RegExp.extend({

  isEmail: function (text) {
    return (/^([\w-])+(\.\w+)*@([\w-])+((\.\w+)+)$/).test(String(text).trim());
  },

  isMobile: function (text) {
    return (/^\d{11}$/).test(String(text).trim());
  },

  isLandline: function (text) {
    return (/^((\d{7,8})|((\d{3,4})-(\d{7,8})(-(\d{1,4}))?)|(\d{7,8})-(\d{1,4}))$/).test(String(text).trim());
  },

  isPhone: function (text) {
    return this.isMobile(text) || this.isLandline(text);
  }
});

// 一些工具方法
var Toolkit = this.Toolkit = {

  // 纵向滚动到指定位置
  scrollTween: function (y, callback) {
    $('html,body').animate({
      scrollTop: (y || 0)
    }, 500, 'easeOutExpo', function () {
      return callback && callback();
    });
  },

  // 取消选中的文本
  clearSelect: function () {
    if (document.selection && document.selection.empty) {
      document.selection.empty();
    }
    else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  },

  // 计算字符串的字节长度
  countByte: function (str) {
    var size = 0;
    for (var i = 0, l = str.length; i < l; i++) {
      size += str.charCodeAt(i) > 255 ? 2 : 1;
    }

    return size;
  },

  // 根据字节截取长度
  substrByByte: function (str, limit) {
    for (var i = 1, l = str.length + 1; i < l; i++) {
      if (this.countByte(str.substring(0, i)) > limit) {
        return str.substring(0, i - 1);
      }
    }

    return str;
  },

  paramOfUrl: function (url) {
    url = url || location.href;
    var paramSuit = url.substring(url.indexOf('?') + 1).split("&");
    var paramObj = {};
    for (var i = 0; i < paramSuit.length; i++) {
      var param = paramSuit[i].split('=');
      if (param.length == 2) {
        var key = decodeURIComponent(param[0]);
        var val = decodeURIComponent(param[1]);
        if (paramObj.hasOwnProperty(key)) {
          paramObj[key] = $.makeArray(paramObj[key]);
          paramObj[key].push(val);
        }
        else {
          paramObj[key] = val;
        }
      }
    }
    return paramObj;
  },

  parseDate: function (str) {
    var list = str.split(/[-:\s]/),
      date = new Date();
    date.setFullYear(list[0]);
    date.setMonth(list[1].toInt() - 1);
    date.setDate(list[2].toInt());
    date.setHours(list[3].toInt());
    date.setMinutes(list[4].toInt());
    date.setSeconds(list[5].toInt());

    return date;
  },

  formatDate: function (date) {
    if (typeOf(date) !== 'date') {
      date = this.parseDate(date);
    }

    return date.getFullYear() + '-' + this.formatLenth(date.getMonth() + 1) + '-' + this.formatLenth(date.getDate()) + ' ' + this.formatLenth(date.getHours()) + ':' + this.formatLenth(date.getMinutes()) + ':' + this.formatLenth(date.getSeconds());
  },

  formatLenth: function (x, len) {
    x = '' + x;
    len = len || 2;
    while (x.length < len) {
      x = '0' + x;
    }
    return x;
  },

  stopPropagation: function (e) {
    e.stopPropagation();
  },

  loadTempl: function (url, force) {
    this.templHash = this.templHash || new Hash();

    if (this.templHash.has(url) && !force) {
      return this.templHash.get(url);
    }

    var self = this;
    return $.get(url, function (templ) {
      self.templHash.set(url, templ);
    });
  },

  resizeIframe: function () {
    try {
      var frame = $(window.parent.document).find('iframe[name=' + window.name + ']');
      frame.css('height', 'auto');
      frame.height(Math.max($(document).height(), 650));
    }
    catch (e) {}
  }
};

// 扩展几个TWEEN
$.extend($.easing, {

  easeInQuad: function (x, t, b, c, d) {
    return c * (t /= d) * t + b;
  },

  easeOutQuad: function (x, t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },

  easeOutExpo: function (x, t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  }
});

// 所有由脚本创建的DOM结构都应该放置在这个容器里
// 以便统一DOM树形结构 方便调试
var DOMPanel = this.DOMPanel = (function () {

  var panel = null;

  return {

    append: function (dom) {
      this.getPanel().append(dom);
    },

    prepend: function (dom) {
      this.getPanel().prepend(dom);
    },

    getPanel: function () {
      if (panel === null) {
        panel = $('#domPanel');
        if (panel.size() === 0) {
          panel = $('<div id="domPanel" />').prependTo('body');
        }

        // 点击对话框不会触发给document绑定的点击行为
        panel.click(Toolkit.cancelBubble);
        panel.mousedown(Toolkit.cancelBubble);
      }

      return panel;
    }
  };

})();

// DATASET 扩展
(function () {

  var encode = function (name) {
    return 'data-' + name.hyphenate().toLowerCase();
  };

  var decode = function (name) {
    return name.replace(/^data-/ig, '').toLowerCase().camelCase();
  };

  var autobox = function (val) {
    if (val != null && new RegExp('^' + Number.from(val) + '$').test(val)) {
      return Number.from(val);
    }
    if (/^(true|false)$/i.test(val)) {
      return String(val) === 'true';
    }
    return val != null ? String(val) : null;
  };

  $.fn.datasets = function () {
    var sets = [];
    this.each(function () {
      sets.push($(this).dataset());
    });
    return sets;
  };

  $.fn.dataset = function (attr, val) {
    // 获取数据集
    var dataset = null;
    if (arguments.length === 0) {
      dataset = {};
      this.eq(0).each(function () {
        var attrs = this.attributes;
        for (var i = 0, l = attrs.length; i < l; i++) {
          var attr = attrs[i];
          if (/^data-/i.test(attr.name)) {
            dataset[decode(encode(attr.name.substring(5)))] = autobox(attr.value);
          }
        }
      });
      return dataset;
    }

    // 返回指定数据
    if (arguments.length == 1 && typeof attr != 'object') {
      return autobox(this.attr(encode(attr)));
    }

    // 设置数据集
    dataset = attr;
    if (typeof attr != 'object') {
      dataset = {};
      dataset[attr] = val;
    }
    var tmp = {};
    $.each(dataset, function (k, v) {
      tmp[encode(k)] = autobox(v);
    });
    return this.attr(tmp);
  };

  $.fn.removeDataset = function (attr) {
    if (typeof attr === 'string') {
      if (attr == '*') {
        attr = [];
        $.each($(this).dataset(), function (k) {
          attr.push(k);
        });
      }
      else {
        attr = [attr];
      }
    }
    return this.each(function () {
      var self = this;
      $.each(attr, function (i, n) {
        $(self).removeAttr(encode(n));
      });
    });
  };
})();

// 指定位置Class
var Offset = this.Offset = new Class({

  Implements: [Options, Events],

  options: {
    top: null,
    left: null
  },

  initialize: function (element, options) {
    this.element = $(element);
    this.setOptions(options);
    this.setOffset();
    this.listenResize();
  },

  setOffset: function () {
    var left = this.options.left;
    // 如果LEFT没有指定 那么水平居中
    if (left == null) {
      left = ($(window).width() - this.element.outerWidth()) / 2;
      left = Math.max(0, left);
    }

    var top = this.options.top;
    // 如果TOP没有指定 那么垂直居中
    if (top == null) {
      top = ($(window).height() - this.element.outerHeight()) / 2;
      top = Math.max(0, top);
    }

    // 如果元素不是fixed定位 那么加上滚动条距离
    if (this.element.css('position') != 'fixed') {
      left += $(document).scrollLeft();
      top += $(document).scrollTop();
    }

    this.element.css({
      left: left,
      top: top
    });
  },

  listenResize: function () {
    var self = this;
    var contextProxy = function () {
      // 防止销毁元素后导致内存泄露（因为RESIZE事件是注册在WINDOW对象上 而不是ELEMENT元素上）
      if (self.element.parent().size() === 0) {
        $(window).unbind('resize', contextProxy);
      }
      else if (self.element.is(':visible') && self.element.css('top').toInt() >= 0) {
        self.setOffset();
      }
    };
    $(window).resize(contextProxy);
    this.addMoveListener();
  },

  addMoveListener: function () {
    var self = this;
    var calculate = function (o, e, s) {
      self.element.css({
        top: o.top + (e.pageY - s.pageY),
        left: o.left + (e.pageX - s.pageX)
      });
    };
    self.element.find('header').css('cursor', 'move').on('mousedown', function (s) {
      var o = self.element.offset();
      $(document).on('mousemove', function (e) {
        calculate(o, e, s);
      });
      $(document).on('mouseup', function () {
        $(document).off('mousemove');
      });
    });
  },

  show: function () {
    this.element.show();
    return this;
  },

  hide: function () {
    this.element.hide();
    return this;
  }

});

// 常用事件类型
var CommonEvents = this.CommonEvents = {
  SHOW: 'CommonEvents.SHOW',
  HIDE: 'CommonEvents.HIDE',
  CLOSE: 'CommonEvents.CLOSE',
  MINIMIZE: 'CommonEvents.MINIMIZE',
  REMOVE: 'CommonEvents.REMOVE',
  LOGIN: 'CommonEvents.LOGIN',
  LOGOUT: 'CommonEvents.LOGOUT',
  START: 'CommonEvents.START',
  SUCCESS: 'CommonEvents.SUCCESS',
  ERROR: 'CommonEvents.ERROR',
  COMPLETE: 'CommonEvents.COMPLETE',
  SWITCH: 'CommonEvents.SWITCH',
  CHANGE: 'CommonEvents.CHANGE',
  NORESULT: 'CommonEvents.NORESULT',
  SELECT: 'CommonEvents.SELECT',
  ENTER: 'CommonEvents.ENTER'
};

// 遮罩层
var MaskLayer = this.MaskLayer = {

  element: null,

  getElement: function () {
    if (this.element === null) {
      this.element = $('#masklayer');
      if (this.element.size() === 0) {
        this.element = $('<div id="masklayer" />').appendTo(DOMPanel.getPanel());
      }

      this.element.on('click', function () {
        DialogManager.present && DialogManager.present.hide();
      });
    }

    return this.element;
  },

  show: function () {
    this.getElement().show();
  },

  hide: function () {
    this.getElement().hide();
  }
};

// 弹窗单例管理
var DialogManager = this.DialogManager = {

  present: null,

  keepSingle: function (dialog) {
    if (instanceOf(this.present, CommonDialog)) {
      this.present.remove(dialog.options.modal);
    }

    this.present = dialog;

    this.bindEvent();
  },

  escCancel: function (e) {
    if (e.keyCode == 27 && DialogManager.present) {
      var dialog = DialogManager.present,
        element = dialog.element;

      if (element.is(':visible') && element.css('top').toInt() > 0) {
        dialog.hide();
      }
    }
  },

  bindEvent: function () {
    $(document).keydown(this.escCancel);
    this.bindEvent = $.noop;
  }
};

// 弹窗
var CommonDialog = this.CommonDialog = new Class({

  Implements: [Options, Events],

  options: {
    title: '提示',
    message: '<section><p class="default-loading"><i class="default-text"></i><span>正在加载，请稍后...</span></p></section>',
    isFixed: true,
    autohide: false,
    denyEsc: false,
    modal: true,
    independence: false,
    visible: true,
    prehide: $.noop
  },

  initialize: function (message, options) {
    //  做个参数格式兼容 方便调用
    if (typeof message === 'object') {
      this.setOptions(message);
    }
    else if (typeof message === 'string') {
      this.options.message = message;
      this.setOptions(options);
    }

    var element = this.element = this.getElement();
    this.bindEvent();

    // 保持单例
    if (this.options.independence !== true) {
      DialogManager.keepSingle(this);
    }

    // 添加到页面
    DOMPanel.append(element);

    // 显示
    if (this.options.visible) {
      this.show();
    }

    // 是否点击遮罩隐藏弹窗
    if (this.options.autohide) {
      element.click(Toolkit.stopPropagation);
      $(document).one('click', this.hide.bind(this));
    }
  },

  getElement: function () {
    var element = $(this.options.message);

    if (this.options.isFixed === true && $.support.fixed) {
      element.css({
        position: 'fixed'
      });
    }

    return element;
  },

  show: function () {
    if (this.options.modal === true) {
      MaskLayer.show();
    }
    if (this.offset) {
      this.offset.setOffset();
    }
    else {
      // 延迟定位是为了能让继承的类可以修改初始化方法改变结构而无需再显示调用show方法
      this.offset = new Offset(this.element, {
        top: this.options.top,
        left: this.options.left
      });
    }

    this.fireEvent(CommonEvents.SHOW, this);
  },

  hide: function () {
    if (this.options.prehide() !== false) {
      MaskLayer.hide();
      this.element.css('top', '-9999px');
      this.fireEvent(CommonEvents.HIDE, this);
    }
  },

  minimize: function () {
    MaskLayer.hide();
    this.element.css('top', '-9999px');
    this.fireEvent(CommonEvents.MINIMIZE, this);
  },

  remove: function (keepMask) {
    if (!keepMask) MaskLayer.hide();
    this.element.remove();
    this.fireEvent(CommonEvents.REMOVE, this);
  },

  find: function (rule) {
    return this.element.find(rule);
  },

  bindEvent: function () {

    var self = this;
    this.find('header .close').click(function () {
      self.hide();
    });
    this.find('.buttonitems .close').click(function () {
      self.hide();
    });
    this.find('header .minify').click(function () {
      self.minimize();
    });
  }
});

// IFRAME 自动展开高度
(function () {
  if (window !== top) {
    window.onload = Toolkit.resizeIframe;

    // 防止页面加载缓慢 默认执行一次
    Toolkit.resizeIframe();
  }
})();

// 左侧菜单自动展开
$(function () {
  var group = $('#lside dl');
  var menus = $('#lside dd');
  var title = $('#lside dt');
  title.on('click', function (e) {
    $(this).parent().toggleClass('active').siblings().removeClass('active');
  });
  menus.on('click', function (e) {
    menus.removeClass('active');
    $(this).addClass('active');
  });
});

$(function () {
  $('dl a').on('click', function (e) {
    $('#mainbox iframe').attr('src', $(this).attr('href'));
    e.preventDefault();
  });
});