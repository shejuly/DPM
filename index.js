if (!localStorage.mainArr) {
  localStorage.mainArr = '[]';
}
var mainArr = JSON.parse(localStorage.mainArr);
var nowId;
// 第二页当前选中的id。
var page2CurrentItemId;
var $SearchInput = $('.searchInput');
var $listUl = $('.siteList');
var $listUl2 = $('.listPlace');
var $commandInput = $('.command');
var $info1 = $('.info1');
var $info2 = $('.info2');
var $switchBar = $('.switcher');
var $page1 = $('.page1');
var $page2 = $('.page2');
var $list2 = $page2.find('.leftBar');
var $copyBtn = $('#copyBtn');

var getCurrentPassWord = function () {
  if (!nowId) {
    return '';
  }
  if (!$commandInput.val()) {
    return '';
  }
  return getPsw(nowId, $commandInput.val());
};
var getObjById = function (id) {
  return mainArr.find(function(e) {
    return e.idName === id
  });
};
var deleteById = function (id) {
  mainArr.splice($.inArray(id, mainArr), 1);
};
var getSoon = function (num1) {
  var num = num1 - 0;
  if (num) {
    if (num === 1) {
      return 'QQ';
    } else if (num === 2) {
      return '微信';
    } else if (num === 3) {
      return '微博';
    } else {
      return '未知soon';
    }
  } else {
    return '';
  }
};
var getLiById = function (id, $ul) {
  return $ul.find('.siteItem[data-id=' + id + ']');
};
// 缓冲器 （防止短时间多次发送同一请求）
var buffer = function (func, time) {
  var self = this;
  if (typeof func !== 'function') {
    return;
  }
  if (typeof time !== 'number') {
    return;
  }
  if (self._commonBufferTimer) clearTimeout(self._commonBufferTimer);
  self._commonBufferTimer = setTimeout(function () {
    func.call(self);
    self._commonBufferTimer = null;
  }, time);
};
var clearPswText = function () {
  $('.pswText_short').text('*******');
  $('.pswText_long').text('*******');
  $('.pswText_tooLong').text('*******');
  $('.pswText_num').text('*******');
};
function ListView () {
  return {
    init: function () {
      this.$el = $listUl;
      this.$el2 = $listUl2;
      this.renderList();
      this.setEvent();
      // 复制用的对象
      new ClipboardJS('#copyBtn');
    },
    setEvent: function () {
      // 输入口令显示密码
      var showPsw = function () {
        var val = $commandInput.val();
        if (!nowId) {
          alert('请选中一个平台');
          return;
        }
        if (val) {
          const pswObj = getPsw(nowId, val);
          $copyBtn.attr('data-clipboard-text', pswObj.short);
          clearPswText();
//          $('.pswText_short').click();
          $info1.show().css('transition', 'transform 0.2s').css('transform', 'scale(1.2)').css('display', 'flex');
          setTimeout(function () {
            $info1.css('transform', 'scale(1)');
          }, 200);
        } else {
          $copyBtn.attr('data-clipboard-text', '');
          $info1.hide();
        }
      };
      $commandInput.on('keydown', function () {
        buffer(function () {
          showPsw();
        }, 500);
      });
      // 点击复制按钮，复制按钮变色
      $copyBtn.on('click', function() {
        $copyBtn.addClass('changeColor');
        setTimeout(function () {
          $copyBtn.removeClass('changeColor');
        }, 1000);
      });
      // 点击某种密码，切换选中状态
      $('.selectPsw').on('click', function (e) {
        $('.selectPsw').removeClass('active');
        $(e.currentTarget).addClass('active');
      });
      // 点击密码***，显示为真密码
      $('.pswText').on('click', function () {
        var pswObj = getCurrentPassWord();
        $('.pswText').text()
      })
    },
    setListEvent: function () {
      var self = this;
      // 第一页，点击某个列表项，右侧显示其内容。
      this.$el.find('li.siteItem').on('click', function (e) {
        var idName = $(e.currentTarget).find('.content').text();
        var obj = getObjById(idName);
        var $userName = $info2.find('.userName');
        var $soonLine = $info2.find('.soonLine');
        nowId = idName;
        if (obj.userName) {
          $userName.html('用户名:' + obj.userName).show();
        } else {
          $userName.hide();
        }
        $info1.hide();
        $info2.show();
        if (obj.toSoon) {
          $soonLine.find('.soonName').html(getSoon(obj.toSoon));
          $soonLine.show();
        } else {
          $soonLine.find('.soonName').html('');
          $soonLine.hide();
        }
        self.$el.find('li.siteItem').removeClass('active');
        $(e.currentTarget).addClass('active');
        $commandInput.val('').focus();
        $copyBtn.attr('data-clipboard-text', '');
      });
      // 第二页，点击某个列表项，左侧被填入。
      this.$el2.find('li.siteItem').on('click', function (e) {
        var idName = $(e.currentTarget).find('.content span.idName').text();
        var obj = getObjById(idName);
        $list2.find('.idName').val(idName);
        $list2.find('.userName').val(obj.userName);
        $list2.find('.href').val(obj.href);
        $list2.find('.toSoon').val(obj.toSoon);
        self.$el2.find('li.siteItem').removeClass('active');
        $(e.currentTarget).addClass('active');
        page2CurrentItemId = idName;
      });
    },
    renderList: function () {
      var lis = '';
      var lis2 = '';
      mainArr.forEach(function (e) {
        lis  += '<li class="siteItem" data-id="' + e.idName + '"><span class="content">' + e.idName + '</span><a href="' + e.href + '" target = "_blank" class="arrow">></a></li>';
        lis2 += '<li class="siteItem" data-id="' + e.idName + '"><span class="content"><span class="idName">' + e.idName + '</span><span class="userName">' + e.userName + '</span><span class="href">' + e.href + '</span><span class="toSoon">' + getSoon(e.toSoon) + '</span></li>';
      });
      this.$el.html(lis);
      this.$el2.html(lis2);
      this.setListEvent();
      if (this.$el.find('li.siteItem') && this.$el.find('li.siteItem').length) {
        this.$el.find('li.siteItem').eq(0).click();
      }
    }
  }
}
var listView = new ListView();
listView.init();
var selectOneItem = function (type) {
  var selectFirst = function ($ul) {
    if ($ul.find('li.siteItem') && $ul.find('li.siteItem').length) {
      $ul.find('li.siteItem').eq(0).click();
    }
  };
  var selectLast = function ($ul) {
    if ($ul.find('li.siteItem') && $ul.find('li.siteItem').length) {
      $ul.find('li.siteItem').eq($ul.find('li.siteItem').length - 1).click();
    }
  };
  var selectCurrent = function ($ul) {
    var li = getLiById(page2CurrentItemId, $ul);
    if (li && li.length) {
      li.click();
    }
  };
  switch (type) {
    case 'first':
      selectFirst($listUl);
      selectFirst($listUl2);
      break;
    case 'current':
      selectCurrent($listUl);
      selectCurrent($listUl2);
      break;
    case 'last':
      selectLast($listUl);
      selectLast($listUl2);
      break;
    default:
      break;
  }
};
var fresh = function (type) {
  localStorage.mainArr = JSON.stringify(mainArr);
  listView.renderList();
  if (type === 'add') {
    selectOneItem('last');
  } else if (type === 'update') {
    selectOneItem('current');
  } else if (type === 'delete') {
    selectOneItem('first');
  }
};
var getPsw = function (nameId, userCommand) {
  var getMixStr = function (str1, str2) {
    var s1 = str1.substr(0, str1.length/2);
    var s2 = str1.substr(str1.length/2);
    var s3 = str2.substr(0, str2.length/2);
    var s4 = str2.substr(str2.length/2);
    return $.md5(s1+s3+s2+s4);
  };
// 加入特殊符号。
// 特殊符号会在最终密码的第2位到第7位之间出现1个。
  var getSpecialPsw = function (str) {
    var specialList = ['*','!','$','#','(','^',')','@','&','%','+','=','[','|',';','{','<','?','>','}',',',']','/','.'];
    var indexWord = str[2];
    var insertIndex = indexWord.codePointAt(0) % 6;
    var insertWord = str[insertIndex];
    var specialIndex = insertWord.codePointAt(0) % 24;
    var specialWord = specialList[specialIndex];
    return str.substr(0, insertIndex) + specialWord + str.substr(insertIndex + 1);
  };
  var psw1 = $.md5(nameId);
  var psw2 = $.md5(userCommand);
  var pswMix = getMixStr(psw1, psw2);
  var pswSpecial = getSpecialPsw(pswMix);
  const psw_mix = psw2[0] + pswMix;
  const psw_special = psw2[0] + pswSpecial;
  return {
    short: psw_special.substr(0, 7),
    long: psw_special.substr(0, 10),
    soLong: psw_special.substr(0, 14),
    shortNum: psw_mix.substr(0, 7)
  };
};
$('.addOneBtn').on('click', function () {
  var obj = {
    idName: $('.page2 .leftBar .idName').val(),
    userName: $('.page2 .leftBar .userName').val(),
    href: $('.page2 .leftBar .href').val(),
    toSoon: $('.page2 .leftBar .toSoon').val()
  };
  var thatObj = getObjById(obj.idName);
  var type = '';
  if (thatObj) {
    // 删除
    if (!obj.userName && !obj.toSoon) {
      deleteById(obj.idName);
      type = 'delete';
    } else {
      // 修改
      thatObj.userName = obj.userName;
      thatObj.href = obj.href;
      thatObj.toSoon = obj.toSoon;
      type = 'update';
    }
  } else {
    // 添加失败
    if (!obj.idName) {
      alert('需要唯一id');
      return;
    }
    // 添加失败
    if (!obj.userName && !obj.toSoon) {
      alert('需要用户名 或者 快速登录');
      return;
    }
    // 添加
    mainArr[mainArr.length] = obj;
    type = 'add';
  }
  fresh(type);
});
$switchBar.find('.switchItem').on('click', function (e) {
  var target = $(e.currentTarget);
  if (!target.hasClass('active')) {
    target.siblings().removeClass('active');
    target.addClass('active');
    if (target.index()) {
      $page1.slideUp(250, function () {
        $page2.slideDown(250).css('display', 'flex');
      });
    } else {
      $page2.slideUp(250, function () {
        $page1.slideDown(250).css('display', 'flex');
      });
    }
  }
});