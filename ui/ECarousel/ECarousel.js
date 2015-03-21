/* ------------------------------------------------------------------------
 * @Name: ECarousel
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * Copyright 2015-2015 JD, Inc. Licensed under MIT
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符 ECarousel 即可
    var EPluginName = 'ECarousel';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function() {};

    // 插件参数默认值
    var defaults = {
        event: 'click',
        loop: false,
        visible: 1,
        step: 1,
        disable: 'disabled'
        // 用来区域前进后退不可用状态 prev-disabled/next-disabled
        disablePrefix: 'prev-',
        selector: {
            body: '[data-carouse="body"]',
            item: '[data-carouse="item"]',
            ctrl: '[data-carouse="ctrl"]',
        }
    };

    function ECarousel($element, options) {
        this.$el = $element;

        this.settings = $.extend(true, {}, defaults, options) ;

        this._defaults = defaults;
        this._name = EPluginName;

        this.init();
    }

    ECarousel.prototype = {
        init: function() {
            this.$body = this.$el.find(this.settings.selector.body);
            this.$item = this.$el.find(this.settings.selector.item);
            this.$ctrl = this.$el.find(this.settings.selector.ctrl);

            var visible = this.settings.visible;
            var step    = this.settings.step;
            var len     = this.$item.length;

            // 步子迈太大
            if ( step > visible ) {
                throw new Error('Step should not more than visible.');
                return 0;
            }

            // 不用初始化
            if ( visible <= len ) {
                return 0;
            }

            this.bindEvent();
            this.prepare();
        },

        // 绑定事件
        bindEvent: function () {

        },

        // 计算滚动范围，尺寸等
        prepare: function () {

        },

        pluginMethod: function() {

        }
    };


    // 多组件初始化防止事件namespace冲突
    $.fn[EPluginName + '_guid'] = 0;

    $.fn[EPluginName] = function (options) {
        if ( !this.length ) {
            console.error('「' + EPluginName + '」 The elements['+ this.selector +'] you passed is empty.');
            return this;
        } else {
            return this.each(function () {
                $(this).data('Eguid', $.fn[EPluginName + '_guid']++);

                var EPluginInstance = new ECarousel($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
