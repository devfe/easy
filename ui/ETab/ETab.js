/* ------------------------------------------------------------------------
 * @Name: ETab
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * GPL v3 license. © 2015 JD Inc.
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符ETab即可
    var EPluginName    = 'ETab';

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
            item     : '[data-tab="item"]',
            // 点击锚点仅切换trigger样式，不切换内容显示状态
            anchor   : '[data-anchor]'
        },
        onReady      : function() {},
        onSwitch     : function() {}
    };


    function ETab($element, options) {
        this.$el       = $element;

        this.settings  = $.extend(true, {}, defaults, options);

        this._defaults = defaults;
        this._name     = EPluginName;
        this._version  = EPluginVersion;

        this.init();
    }

    ETab.prototype = {
        init: function() {
            var settings  = this.settings;
            var selector  = settings.selector;

            this.triggers = this.$el.find(selector.trigger);
            this.items    = this.$el.find(selector.item);
            this.anchors  = this.$el.find(selector.anchor);

            if ( this.triggers.length - this.anchors.length !== this.items.length ) {
                throw new Error('「' + EPluginName + '」 The tab item count must equals to tab content count.');
            } else {
                this.bindEvent();

                /*
                *  默认情况下不触发当前tab事件, 一般情况下tab组件的默认属性
                *  比如高亮class和内容的显示与否由后端同步输出到页面,避免js
                *  修改产生的闪动。
                */
                if ( typeof settings.defaultIndex === 'number' ) {
                    this.triggers.eq(settings.defaultIndex).trigger(settings.event);
                }

                settings.onReady.call(this, settings.defaultIndex);
            }

            // 如果事件是鼠标移入，添加延迟防止误操作
            if ( /mouseover|mouseenter/.test(settings.event) && !settings.delay ) {
                this.settings.delay = 200;
            }
        },

        bindEvent: function() {
            var _this    = this;
            var settings = _this.settings;
            var selector = settings.selector;

            this.$el.undelegate(settings.event)
            .delegate(selector.trigger, settings.event, function() {
                _this.handleEvent( $(this) );
            });

            if ( /mouseover|mouseenter/.test(settings.event) ) {
                this.$el.undelegate('mouseout mouseleave')
                .delegate(selector.trigger, 'mouseout mouseleave', function() {
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
            var triggers = this.triggers;
            var currTris = triggers.eq(n);

            triggers.removeClass(this.settings.current);
            currTris.addClass(this.settings.current);

            // 点击锚点仅切换trigger样式，不切换内容显示状态
            if ( !currTris.is(this.settings.selector.anchor) ) {
                this.items.hide().eq(n).show();
            }

            this.settings.onSwitch.call(this, n);

            if ( this.settings.lazyload ) {
                this.loadImages(this.items.eq(n));
            }
        },
        loadImages: function($el) {
            var lazyImgAttr = this.settings.lazyload;
            var $imgs       = $el.find('['+ lazyImgAttr +']');

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
            console.error('「' + EPluginName + '」 The elements['+ this.selector +'] you passed is empty.');
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
