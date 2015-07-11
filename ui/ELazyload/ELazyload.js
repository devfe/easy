/* ------------------------------------------------------------------------
 * @Name: ELazyload
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * GPL v3 license. © 2015 JD Inc.
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
        // 加载完成后删除source属性
        removeSource: true,
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
        onComplete: emptyFunction,
        onError: emptyFunction,
        onLoad: emptyFunction
    };


    function ELazyload($element, options) {
        this.$el       = $element;

        this.settings  = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name     = EPluginName;
        this._version  = EPluginVersion;
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

            this.supportRect = this.supportClientRect();

            // 初始化完成立即加载在可视区的图片
            this.check(this.$targets);

            this.settings.onReady.call(this);
        },

        // 判断是否支持dataURI，避免在个别IE浏览器里面循环触发onerror事件产生stack overflow at line 0的错误
        supportDataURI: function(fn) {
            // 如果已经检测过直接返回缓存值
            if ( this.isSupportDataURI ) {
                return fn(this.isSupportDataURI);
            }

            var data = new Image();
            data.onload = data.onerror = function(){
                var index = this.width === 1 && this.height === 1 ? 1 : 0;

                this.isSupportDataURI = index;
                fn(index);
            };
            data.src = this.settings.placeholder[1];
        },

        bindEvent: function($img) {
            var _this = this;

            if ( $img && this.settings.type === 'img' ) {
                $img.get(0).onload = function() {

                    _this.onLoad($img);
                };

                $img.get(0).onerror = function() {
                    $img.removeClass(_this.settings.loadingClass)
                    .addClass(_this.settings.errorClass);
                    $img.data('loaded', false);

                    // 防止浏览器展示默认的图片失败样式
                    _this.supportDataURI(function(support) {
                        var placeholder = _this.settings.placeholder[support];
                        $img.attr('src', placeholder);

                        _this.placeholder = placeholder;
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
            var src = $ele.attr('src');
            if ( src !== this.settings.placeholder[0]
                && src !== this.settings.placeholder[1]) {

                $ele.removeClass(this.settings.loadingClass);
                $ele.data('loaded', true);

                this.loaded.push(1);

                this.settings.onLoad.call(this, $ele);
            }
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

                    if ( _this.settings.removeSource ) {
                        $ele.removeAttr(_this.settings.source);
                    }
                } else {
                    $ele.removeClass(_this.settings.loadingClass);
                }
                _this.settings.onAppear.call(_this, $ele);
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

            if ( !this.placeholderAdded ) {
                this.setDefaultPlaceholder($imgsUnloaded);
            }

            if ( this.settings.debug ) {
                console.log( 'Total:' + this.total
                            + '\u3000 current:' + $images.length
                            + '\u3000 Left: ' + $imgsUnloaded.length );
            }

            if ( this.total === this.loaded.length ) {
                this.$w.unbind(this._eventString);
                this.settings.onComplete.call(this);

                if ( this.settings.debug ) {
                    console.log('All done.');
                }
            }
        },

        // 设置默认的占位图片
        setDefaultPlaceholder: function($ele) {
            var _this = this;

            this.supportDataURI(function (support) {
                var placeholder = _this.settings.placeholder[support];

                var i = 0, len = $ele.length;
                while (i < len) {
                    $ele.get(i).setAttribute('src', placeholder);
                    i++;
                }

                _this.placeholderAdded = true;
            });
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

        // 高级浏览器支持元素坐标方法
        supportClientRect: function () {
            if ( typeof this.isSupportClientRect !== 'undefined' ) {
                return this.isSupportClientRect;
            }

            var div = document.createElement('div');
            var support = 'getBoundingClientRect' in div;

            div = null;
            this.isSupportClientRect = support;
            return support;
        },

        // 元素是否在窗口内
        inWindow: function($ele) {
            var wHeight = this.$w.height();
            var scrollTop = $('body').scrollTop() || $('html').scrollTop();

            // 优先使用 getBoundingClientRect 来判断元素坐标
            if ( this.supportRect ) {
                var coords = $ele.get(0).getBoundingClientRect();
                var eleTop = coords.top;
                var eleLeft = coords.left;
                var eleBottom = coords.top + coords.height;

                return (
                        eleTop >= 0
                        && eleLeft >= 0
                        && eleTop <= wHeight + this.settings.threshold
                    ) || (
                        eleBottom >= 0
                        && eleLeft >= 0
                        && eleBottom <= wHeight
                    );
            } else {
                var eleTop= $ele.offset().top;
                var eleHeight = $ele.height();
                var eleBottom = eleTop + eleHeight;

                return (
                        eleTop < wHeight + scrollTop + this.settings.threshold
                        && eleTop > scrollTop
                    ) || (
                        eleBottom < wHeight + scrollTop
                        && eleBottom > scrollTop
                    );
            }
        }
    };

    // 多组件初始化防止事件namespace冲突
    $.fn[EPluginName + '_guid'] = 0;

    $.fn[EPluginName] = function (options) {
        if ( !this.length ) {
            console.log('「' + EPluginName + '」 The elements['+ this.selector +'] you passed is empty.');
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
