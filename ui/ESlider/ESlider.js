/* ------------------------------------------------------------------------
 * @Name: ESlider
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * Copyright 2015-2015 JD, Inc. Licensed under MIT
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符ESlider即可
    var EPluginName = 'ESlider';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function() {};

    // 插件参数默认值
    var defaults = {
        debug        : false,
        event        : 'mouseover',
        onHoverStop  : false,
        delay        : 0,
        interval     : 5000,
        pager        : false,
        defaultIndex : null,
        current      : 'current',
        lazyload     : null,
        selector     : {
            trigger  : '[data-slider="trigger"]',
            item     : '[data-slider="item"]',
            pager    : '[data-slider="prev"],[data-slider="next"]',
        },
        onReady      : function() {},
        onSwitch     : function() {}
    };

    function ESlider($element, options) {
        this.$el = $element;

        this.settings = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = EPluginName;

        this.init();
    }

    ESlider.prototype = {
        init: function() {
            this.triggers = this.$el.find(this.settings.selector.trigger);
            this.items    = this.$el.find(this.settings.selector.item);

            this.interval = null;

            this.length   = this.items.length;
            this.current  = this.settings.defaultIndex || 0;

            if ( this.triggers.length !== this.items.length ) {
                throw new Error('The tab item count must equals to tab content count.');
            } else {
                this.bindEvent();

                /*
                *  默认情况下不触发当前Slider事件, 一般情况下Slider组件的默认属性
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

            // 特殊情况设置interval为null可以阻止默认播放焦点图
            if ( this.settings.interval ) {
                this.start();
            }
        },

        bindEvent: function() {
            var _this           = this;
            var itemSelector    = this.settings.selector.item;
            var triggerSelector = this.settings.selector.trigger;
            var pagerSelector   = this.settings.selector.pager;
            var stopSelector    = triggerSelector + ',' + pagerSelector;

            this.$el.undelegate(this.settings.event)
            .delegate(this.settings.selector.trigger, this.settings.event, function() {
                _this.handleEvent( $(this) );
            });

            // 按钮鼠标hover暂停播放
            this.$el.undelegate('mouseover mouseout')
            .delegate(stopSelector, 'mouseover', function() {
                _this.stop();
            })
            .delegate(stopSelector, 'mouseout', function() {
                _this.start();
            });

            if ( this.settings.pager ) {
                this.$el.undelegate('click')
                .delegate(pagerSelector, 'click', function() {
                    var isNext = $(this).attr('data-slider') === 'next';
                    if ( isNext ) {
                        _this.setCurrent(++_this.current);
                    } else {
                        _this.setCurrent(--_this.current);
                    }
                });
            }

            // 焦点图内容鼠标hover暂停播放
            if ( this.settings.onHoverStop ) {
                this.$el.undelegate('mouseover mouseout')
                .delegate(itemSelector, 'mouseover', function() {
                    _this.stop();
                })
                .delegate(itemSelector, 'mouseout', function() {
                    _this.start();
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

        // 计算当前翻页下标关系决定最终去向
        setCurrent: function(index) {
            if ( index + 1 > this.length ) {
                this.current = 0;
            } else if ( index < 0 ) {
                this.current = this.length - 1;
            } else {
                this.current = index;
            }

            this.go(this.current);
        },

        go: function(n) {
            this.triggers.removeClass(this.settings.current).eq(n).addClass(this.settings.current);
            this.items.removeClass(this.settings.current).eq(n).addClass(this.settings.current);

            this.settings.onSwitch.call(this, n);

            if ( this.settings.lazyload ) {
                this.loadImages(this.items.eq(n));
            }

            this.current = n;
        },

        start: function() {
            var _this = this;

            this.interval = setInterval(function() {
                _this.setCurrent(++_this.current);

                if ( _this.settings.debug ) {
                    console.log('Total: ' + _this.length + ' Current: ' + _this.current);
                }

            }, this.settings.interval);
        },

        stop: function() {
            clearInterval(this.interval);
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


    // 多组件初始化防止事件namespace冲突
    $.fn[EPluginName + '_guid'] = 0;

    $.fn[EPluginName] = function (options) {
        if ( !this.length ) {
            console.error('The elements['+ this.selector +'] you passed is empty.');
            return this;
        } else {
            return this.each(function () {
                $(this).data('Eguid', $.fn[EPluginName + '_guid']++);

                var EPluginInstance = new ESlider($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
