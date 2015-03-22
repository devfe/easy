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
        debug: false,
        // 用来区域前进后退不可用状态 prev-disabled/next-disabled
        prevDisable: 'prev-disabled',
        nextDisable: 'next-disabled',
        // 一般情况不需要显式的传组件宽高值，插件会自动计算第一个item的宽高
        // 来确定 $el 的宽高度: width = itemW * visible, height = itemH
        // 此参数用优先级高于组件自动计算
        width: null,
        height: null,
        pager: null,
        pagerCurrent: 'current',
        pagerTPL: '<a href="#none" class="cName" data-carouse="page">{n}</a>',
        selector: {
            wrap: '[data-carouse="wrap"]',
            body: '[data-carouse="body"]',
            item: '[data-carouse="item"]',
            prev: '[data-carouse="prev"]',
            next: '[data-carouse="next"]',
            page: '[data-carouse="page"]'
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
            var sPrev = this.settings.selector.prev;
            var sNext = this.settings.selector.next;

            this.$wrap = this.$el.find(this.settings.selector.wrap);
            this.$body = this.$el.find(this.settings.selector.body);
            this.$item = this.$el.find(this.settings.selector.item);

            // 按钮元素可以不依赖dom
            this.$prev = typeof sPrev === 'string'
                ? this.$el.find(sPrev)
                : sPrev;

            this.$next = typeof sNext === 'string'
                ? this.$el.find(sNext)
                : sNext;

            // 决定滚动效果的元信息
            var meta = {
                // visible
                v: this.settings.visible,
                // step
                s: this.settings.step,
                // item width
                w: this.settings.width || this.$item.eq(0).outerWidth(),
                // item heigth
                h: this.settings.height || this.$item.eq(0).outerHeight(),
                // length
                l: this.$item.length

            };

            // 步子迈太大
            if ( meta.s > meta.v ) {
                throw new Error('Step should not more than visible.');
                return 0;
            }

            // 不用初始化
            if ( meta.l <= meta.v ) {
                if ( this.settings.debug ) {
                    console.info('Init failed, visible less than length');
                }
                return 0;
            }

            this.m = meta;

            // total frame
            this.total =  Math.ceil((meta.l - meta.v) / meta.s);
            // current frame
            this.current = 0;

            this.prepare(meta);
            this.bindEvent();
        },

        // 绑定事件
        bindEvent: function () {
            var _this = this;
            var evt = this.settings.event;

            this.$prev.unbind(evt)
            .bind(evt, function () {
                _this.prev();
            });
            this.$next.unbind(evt)
            .bind(evt, function () {
                _this.next();
            });
        },

        // 计算滚动范围，尺寸等
        prepare: function (m) {
            this.$wrap.css({
                width: m.w * m.v,
                height: m.h,
                overflow: 'hidden'
            });

            this.$body.css({
                width: m.w * m.l,
                height: m.h
            });

            if ( this.settings.pager ) {
                this.renderPager(this.total);
            }
        },
        renderPager: function (n) {
            var i = 0;
            var result = [];

            this.$pager = this.$el.find('.' + this.settings.pager);

            while ( i < n ) {
                var cName = i === 0 ? 'current' : '';
                result.push(this.settings.pagerTPL.replace(/\{n\}/g, i+1).replace('cName', cName));
                i++;
            }
            console.log(result)
            this.$pager.append(result.join(''));
        },
        // 上一帧
        prev: function () {
            if ( this.settings.loop ) {
                if ( this.current <= 0 ) {
                    this.current = this.total;
                } else {
                    this.current--;
                }
            } else {
                if ( this.current <= 0 ) {
                    return 0;
                } else {
                    this.current--;
                }
            }

            this.go(this.current);
        },
        // 下一帧
        next: function () {
            if ( this.settings.loop ) {
                if ( this.current >= this.total ) {
                    this.current = 0;
                } else {
                    this.current++;
                }
            } else {
                if ( this.current >= this.total ) {
                    return 0;
                } else {
                    this.current++;
                }
            }

            this.go(this.current);
        },

        go: function(n) {
            this.$body.css({
                left: - this.m.w * n * this.m.s
            });

            if ( !this.settings.loop ) {
                this.setDisabled(n);
            }
            console.log('Switch to:' + n + ' in ' + this.total + ' frame');
        },
        // 上一帧
        setDisabled: function (n) {
            var nClass = this.settings.nextDisable;
            var pClass = this.settings.prevDisable;

            if ( n >= this.total ) {
                this.$next.addClass(nClass);
            } else {
                this.$next.removeClass(nClass);
            }
            if ( n <= 0 ) {
                this.$prev.addClass(pClass);
            } else {
                this.$prev.removeClass(pClass);
            }
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
