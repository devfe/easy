/* ------------------------------------------------------------------------
 * @Name: ELazyload
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * Copyright 2015-2015 JD, Inc. Licensed under MIT
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符ELazyload即可
    var EPluginName = 'ELazyload';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function() {};

    // 插件参数默认值
    var defaults = {
        // 在很多浏览器中setTimeout/setInterval的最小值都限制为10ms
        // ref: https://twitter.com/nwind/status/182758869951463425
        // ref: http://blog.csdn.net/aimingoo/article/details/1451556
        delay: 50,
        type: 'img',
        source: 'data-src',
        threshold: 0,
        loadingClass: 'ELazy-loading',
        errorClass: 'ELazy-error',
        debug: false,
        placeholder: [
            'http://misc.360buyimg.com/lib/img/e/blank.gif',
            'data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEHAAIALAAAAAABAAEAAAICVAEAOw=='
        ],
        onAppear: emptyFunction,
        onReady: emptyFunction,
        onError: emptyFunction,
        onLoad: emptyFunction
    };


    function ELazyload($element, options) {
        this.$el       = $element;

        this.settings  = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name     = EPluginName;
        this._guid     = $element.data('Eguid');

        this.init();
    }

    ELazyload.prototype = {
        init: function() {
            if ( this.settings.type === 'img' ) {
                this.$targets = this.$el.eq(0).is('img')
                    ? this.$el
                    : this.$el.find('['+ this.settings.source +']');
            } else {
                this.$targets = this.$el;
            }
            //console.log(this._guid);

            this._eventString = 'scroll.lazyload.'+ this._guid +' resize.lazyload.' + this._guid;

            this.$w = $(window);

            this.total = this.$targets.length;

            // 滚动时延迟加载计时器
            this.timer = null;
            // 滚动的过程中是否可以加载图片
            this.isCheckable = true;

            // 加载完一个添加一个标识，用来判断是否全部加载完成
            this.loaded = [];

            this.bindEvent();

            // 初始化完成立即加载在可视区的图片
            this.check(this.$targets);

            this.settings.onReady.call(this);
        },

        bindEvent: function($img) {
            var _this = this;

            // 判断是否支持dataURI，避免在个别IE浏览器里面循环触发onerror事件产生stack overflow at line 0的错误
            function supportDataURI(fn) {
                var data = new Image();
                data.onload = data.onerror = function(){
                    fn(this.width === 1 && this.height === 1 ? 1 : 0);
                };
                data.src = _this.settings.placeholder[1];
            }

            if ( $img && this.settings.type === 'img' ) {
                $img.get(0).onload = function() {

                    _this.onLoad($img);
                };

                $img.get(0).onerror = function() {
                    $img.removeClass(_this.settings.loadingClass)
                    .addClass(_this.settings.errorClass);
                    $img.data('loaded', false);

                    // 防止浏览器展示默认的图片失败样式
                    supportDataURI(function(support) {
                        $img.attr('src', _this.settings.placeholder[support]);
                    });

                    _this.settings.onError.call(_this, $img);
                };
            } else {
                this.$w.unbind(this._eventString)
                .bind(this._eventString, function() {
                    _this.handleCheck(_this.$targets);
                });
            }
        },

        // 加载完成事件句柄
        onLoad: function($ele) {

            $ele.removeClass(this.settings.loadingClass);
            $ele.data('loaded', true);

            this.loaded.push(1);

            this.settings.onLoad.call(this, $ele);
        },

        // 页面滚动时添加节流逻辑
        handleCheck: function($images) {
            var _this = this;

            if ( this.isCheckable ) {
                this.isCheckable = false;

                this.timer = setTimeout(function() {
                    _this.check($images);
                    _this.isCheckable = true;
                }, this.settings.delay);
            }
        },

        // 判断加载可视区图片
        check: function($images) {
            var _this = this;

            // 剩余未加载的图片
            var $imgsUnloaded = $();

            function load($ele) {
                $ele.data('loaded', true);
                if ( _this.settings.type === 'img' ) {
                    $ele.attr('src', $ele.attr(_this.settings.source));
                } else {
                    $ele.removeClass(_this.settings.loadingClass);
                    _this.settings.onAppear.call(_this);
                }
            }

            $images.each(function() {
                var $this = $(this);

                // !已经加载过真实图片地址
                if ( !$this.data('loaded') ) {
                    $this.addClass(_this.settings.loadingClass);
                    $this.data('loaded', !!$this.attr('src'));

                    _this.insertHolder($this);
                    _this.bindEvent($this);
                }

                // 加载非图片隐藏模块更改检查元素引用
                var $targetToCheck = _this.$holder || $this;

                if ( _this.inWindow($targetToCheck) ) {
                    load( $this );
                } else {
                    $imgsUnloaded = $imgsUnloaded.add($this);
                }

                if ( _this.settings.debug ) {
                    if ( $this.next().is( $('.img-status') ) ) {
                        $this.next().html('Loaded: ' + $this.data('loaded'));
                    } else {
                        $this.after( '<div class="img-status">Loaded: ' + $this.data('loaded') + '</div>' );
                    }
                }
            });

            // 重置查询范围
            this.$targets = $imgsUnloaded;

            if ( this.settings.debug ) {
                console.log( 'Total:' + this.total
                            + '\u3000 current:' + $images.length
                            + '\u3000 Left: ' + $imgsUnloaded.length );
            }

            if ( this.total === this.loaded.length ) {
                this.$w.unbind(this._eventString);

                if ( this.settings.debug ) {
                    console.log('All done.');
                }
            }
        },

        // 插入点位元素，计算出隐藏元素的大概位置
        insertHolder: function($ele) {
            if ( this.settings.type !== 'img' ) {
                if ( !$ele.is(':visible') && !$ele.prev().is('.Elazy-holder') ) {
                    $ele.before('<ins class="ELazy-holder ELazy-holder'+ this._guid +'"></ins>');
                    this.$holder = $ele.prev('.ELazy-holder');
                }
            }
        },

        // 元素是否在窗口内
        inWindow: function($ele) {
            var wHeight = this.$w.height();
            var scrollTop = $('body').scrollTop() || $('html').scrollTop();
            var eleTop= $ele.offset().top;
            var eleHeight = $ele.height();
            var eleBottom = eleTop + eleHeight;

            return (eleTop < wHeight + scrollTop + this.settings.threshold && eleTop > scrollTop)
                    || eleBottom < wHeight + scrollTop && eleBottom > scrollTop;
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

                var EPluginInstance = new ELazyload($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
