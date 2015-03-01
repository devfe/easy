/* ------------------------------------------------------------------------
 * @Name: ETab
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * Copyright 2015-2015 JD, Inc. Licensed under MIT
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符ETab即可
    var EPluginName = 'ETab';

    // 插件版本
    var EPluginVersion = '@VERSION';

    // 插件参数默认值
    var defaults = {
        event        : 'click',
        delay        : 0,
        defaultIndex : null,
        current      : 'current',
        lazyload     : null,
        selector     : {
            trigger  : '[data-tab="trigger"]',
            item     : '[data-tab="item"]'
        },
        onReady      : function() {},
        onSwitch     : function() {}
    };


    function ETab($element, options) {
        this.$el       = $element;

        this.settings  = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name     = EPluginName;
        this._version  = EPluginVersion;

        this.init();
    }

    ETab.prototype = {
        init: function() {
            this.triggers = this.$el.find(this.settings.selector.trigger);
            this.items    = this.$el.find(this.settings.selector.item);

            if ( this.triggers.length !== this.items.length ) {
                throw new Error('The tab item count must equals to tab content count.');
            } else {
                this.bindEvent();

                /*
                *  默认情况下不触发当前tab事件, 一般情况下tab组件的默认属性
                *  比如高亮class和内容的显示与否由后端同步输出到页面,避免js
                *  修改产生的闪动。
                */
                if ( typeof this.settings.defaultIndex === 'number' ) {
                    this.triggers.eq(this.settings.defaultIndex).trigger(this.settings.event);
                }

                this.settings.onReady.call(this, this.settings.defaultIndex);
            }

            // 如果事件是鼠标移入，添加延迟防止误操作
            if ( /mouseover|mouseenter/.test(this.settings.event) && !this.settings.delay ) {
                this.settings.delay = 200;
            }
        },

        bindEvent: function() {
            var _this = this;

            this.$el.undelegate(this.settings.event)
            .delegate(this.settings.selector.trigger, this.settings.event, function() {
                _this.handleEvent( $(this) );
            });

            if ( /mouseover|mouseenter/.test(this.settings.event) ) {
                this.$el.undelegate('mouseout mouseleave')
                .delegate(this.settings.selector.trigger, 'mouseout mouseleave', function() {
                    clearTimeout(_this.timer);
                });
            }
        },

        handleEvent: function($target) {
            var _this = this;
            var index = this.triggers.index($target);

            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                _this.go(index);
            }, this.settings.delay);
        },

        go: function(n) {
            this.triggers.removeClass(this.settings.current).eq(n).addClass(this.settings.current);
            this.items.hide().eq(n).show();

            this.settings.onSwitch.call(this, n);

            if ( this.settings.lazyload ) {
                this.loadImages(this.items.eq(n));
            }
        },
        loadImages: function($el) {
            var lazyImgAttr = this.settings.lazyload;
            var $imgs = $el.find('['+ lazyImgAttr +']');

            $imgs.each(function() {
                var originSrc = $(this).attr(lazyImgAttr);

                if ( originSrc ) {
                    $(this).attr('src', originSrc).removeAttr(lazyImgAttr);
                }
            });
        }
    };

    $.fn[EPluginName] = function (options) {
        if ( !this.length ) {
            console.error('The elements['+ this.selector +'] you passed is empty.');
            return this;
        } else {
            return this.each(function () {
                var EPluginInstance = new ETab($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
