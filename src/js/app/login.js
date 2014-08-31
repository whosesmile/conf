/**
 *  将非标准浏览器的本地存储桥接成标准API (IE6 IE7)
 */
(function () {

  function UserData() {
    this.userData = null;
    this.name = location.hostname;

    if (!this.userData) {
      try {
        this.userData = document.documentElement;
        this.userData.addBehavior("#default#userData");

        var expires = new Date();
        expires.setDate(expires.getDate() + 365);
        this.userData.expires = expires.toUTCString();
      }
      catch (e) {}
    }
  }

  UserData.prototype = {

    setItem: function (key, data) {
      try {
        this.userData.setAttribute(key, data);
        this.userData.save(this.name);
      }
      catch (e) {}
    },

    getItem: function (key) {
      try {
        this.userData.load(this.name);
      }
      catch (e) {}

      return this.userData.getAttribute(key);
    },

    removeItem: function (key) {
      try {
        this.userData.load(this.name);
        this.userData.removeAttribute(key);
        this.userData.save(this.name);
      }
      catch (e) {}
    },

    clear: function () {
      try {
        this.userData.load(this.name);
        var attributes = this.userData.attributes;
        for (var i = 0; i < attributes.length; i++) {
          var key = attributes[i].name;
          if (key != 'type' && key != 'style') this.userData.removeAttribute(key);
        }
        this.userData.save(this.name);
      }
      catch (e) {}
    }

  };

  // 如果不支持本地存储
  // 使用USERDATA替代接口
  try {
    if (!window.localStorage) {
      window.localStorage = new UserData();
    }
  }
  catch (e) {
    window.localStorage = new UserData();
  }
})();

/**
 * 根据上次背景计算本次的背景图
 */
$(function () {
  var address = 'url(/assets/images/login/bg/{1}/1920.jpg)';

  var nextBackground = function () {
    var limit = 8;

    var background = parseInt(localStorage.getItem('background') || '00', 10) + 1;

    if (background > limit) {
      background = 1;
    }

    if (background < 10) {
      background = '0' + background;
    }

    localStorage.setItem('background', background);
    return background;
  };

  $('body').css('background-image', address.replace('{1}', nextBackground()));
});

/**
 * 防止页面高度过小 无法看到全部内容
 */
// $(function () {
//   var nodes = $('#banner,#footer');
//   var limit = parseInt($('body').css('minHeight'), 10);

//   $(window).resize(function () {
//     var position = $('body').height() <= limit ? 'static' : 'absolute';
//     nodes.css('position', position);
//   }).triggerHandler('resize');

// });