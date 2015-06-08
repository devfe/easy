/* ------------------------------------------------------------------------
 * @Name: ECarousel
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * GPL v3 license. © 2015 JD Inc.
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符 ECarousel 即可
    var EPluginName    = 'ECarousel';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction  = function() {};

    // 插件参数默认值
    var defaults = {
        event           : 'click',
        loop            : false,
        visible         : 1,
        step            : 1,
        auto            : false,
        direction       : 'x',
        debug           : false,
        // 用来区域前进后退不可用状态 prev-disabled/next-disabled
        prevDisable     : 'prev-disabled',
        nextDisable     : 'next-disabled',
        // 一般情况不需要显式的传组件宽高值，插件会自动计算第一个item的宽高
        // 来确定 $el 的宽高度 : width = itemW * visible, height = itemH
        // 此参数用优先级高于组件自动计算
        width           : null,
        height          : null,
        pager           : null,
        pagerCurrent    : 'current',
        pagerEvent      : 'click',
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
        this.$el       = $element;

        this.settings  = $.extend(true, {}, defaults, options) ;

        this._defaults = defaults;
        this._name     = EPluginName;
        this._version  = EPluginVersion;

        this.init();
    }

    ECarousel.prototype = {
        init: function() {
            var settings = this.settings;
            var selector = settings.selector;

            var sPrev    = selector.prev;
            var sNext    = selector.next;

            this.$wrap   = this.$el.find(selector.wrap);
            this.$body   = this.$el.find(selector.body);
            this.$item   = this.$el.find(selector.item);
            this.$pages  = this.$el.find(selector.page);

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
                v: settings.visible,
                // step
                s: settings.step,
                // item width
                w: settings.width || this.$item.eq(0).outerWidth(),
                // item heigth
                h: settings.height || this.$item.eq(0).outerHeight(),
                // length
                l: this.$item.length

            };

            // 步子迈太大
            if ( meta.s > meta.v ) {
                throw new Error('Step should not more than visible.');
            }

            // 不用初始化
            if ( meta.l <= meta.v ) {
                if ( settings.debug ) {
                    console.info('Init failed, visible less than length');
                }
                return 0;
            }

            this.m       = meta;

            // total frame
            this.total   =  Math.ceil((meta.l - meta.v) / meta.s);
            // current frame
            this.current = 0;

            this.timer   = null;

            this.$wrap.addClass('ECarousel-dir-' + settings.direction);

            this.prepare(meta);
            this.bindEvent();

            if ( settings.auto ) {
                settings.loop = true;
                this.start();
            }
        },

        // 绑定事件
        bindEvent: function () {
            var _this = this;

            var settings = this.settings;
            var selector = settings.selector;

            var evt = settings.event;

            this.$prev.unbind(evt)
            .bind(evt, function () {
                _this.prev();
            });

            this.$next.unbind(evt)
            .bind(evt, function () {
                _this.next();
            });

            if ( settings.pager ) {
                this.$el.undelegate(settings.pagerEvent)
                .delegate(
                    selector.page,
                    settings.pagerEvent,
                    function () {
                        _this.handlePager( $(this) );
                    }
                );
            }
        },

        // 计算滚动范围，尺寸等
        prepare: function (m) {
            var settings   = this.settings;
            var selector   = settings.selector;
            var isX        = settings.direction === 'x';

            var wrapWidth  = isX ? m.w * m.v : m.w;
            var wrapHeight = isX ? m.h : m.h * m.v;

            var bodyWidth  = isX ? m.w * m.l : m.w;
            var bodyHeight = isX ? m.h : m.h * m.l;

            this.$wrap.css({
                width: wrapWidth,
                height: wrapHeight,
                overflow: 'hidden'
            });

            this.$body.css({
                width: bodyWidth,
                height: bodyHeight
            });

            if ( settings.pager
                && this.$el.find(selector.page).length < 1 ) {
                this.renderPager(this.total);
            }
        },

        handlePager: function ($ele) {
            var index = this.$pages.index( $ele );

            this.go(index);
        },
        renderPager: function (n) {
            var settings = this.settings;
            var i = 0;
            var result = [];

            this.$pager = this.$el.find('.' + settings.pager);

            while ( i <= n ) {
                var cName = i === 0 ? 'current' : '';
                result.push(settings.pagerTPL.replace(/\{n\}/g, i+1).replace('cName', cName));
                i++;
            }
            this.$pager.append(result.join(''));

            this.$pages = this.$el.find(settings.selector.page);
        },
        setPagerStatus: function (n) {
            var cName = this.settings.pagerCurrent;

            this.$pages.removeClass(cName);
            this.$pages.eq(n).addClass(cName);
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

        start: function () {
            var _this    = this;
            var settings = _this.settings;
            var interval = typeof settings.auto === 'number'
                ? settings.auto
                : 5000;

            this.timer = setInterval(function () {
                _this.$next.trigger(settings.event);
            }, interval);
        },

        stop: function () {
            clearInterval(this.timer);
        },

        go: function(n) {
            var settings = this.settings;
            var css = settings.direction === 'x'
                ? { left: - this.m.w * n * this.m.s }
                : { top: - this.m.w * n * this.m.s }

            this.current = n;

            this.$body.css(css);

            if ( !settings.loop ) {
                this.setDisabled(n);
            }
            if ( settings.pager ) {
                this.setPagerStatus(n);
            }

            if ( settings.debug ) {
                console.log('Switch to:' + n + ' in ' + this.total + ' frame');
            }
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
