# Easy UI jQuery 插件设计规范

## 编码规范

### 使用匿名函数包装插件实例

    (function() {

    })();

### 使用 prototype + factory 模式编写插件主对象

    function Plugin($element, options) {

    }
    Plugin.prototype = {
        init: function() {},
        method: function() {}
    };

### 使用深度继承包装设置

    this.settings = $.extend(true, {}, defaults, options);


注意区分下面三种变量

* settings 表示继承用户入参、默认参数后的插件需要读写的参数
* options 表示提供给用户可以传入的参数
* defaults 表示插件的默认设置

### 选择dom元素集合在selector参数中

    selector: {
        selector1: '.class',
        selector2: '#id',
        selector3: '[attribute="val"]'
    }

## 插件错误提示

好的程序要在必要的地方给用户提示，引导用户更好的使用插件，提示分以下三种情况：

**注意：生产环境中下面的log都是不应该被显示的**

### 1. console.log

插件开启debug参数，在一些重要的流程上插件内部应该提供必要的 log 信息,
比如：图片旋转插件，在切换完一帧后如果开启了debug模式，应该在控制台log一些信息，方便开发人员调试

    if ( settings.debug ) {
        console.log('Switch to:' + n + ' in ' + this.total + ' frame');
    }

### 2. console.info

插件内部的容错提醒，比如用户传入无效参数

    if ( !param.length ) {
        console.info('Param empty.');
    }

### 3. console.error

插件遇到了错误，必须调整使用方式才能解决
比如：图片旋转插件用户设置的step 大于 visible的时候必须终止插件，提醒用户可能会miss掉内容

    if ( meta.s > meta.v ) {
        console.error('Step should not more than visible.');
    }
