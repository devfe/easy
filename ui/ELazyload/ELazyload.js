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

    // 插件参数默认值
    var defaults = {
        source: 'data-src',
        threshold: 0,
        loadingClass: 'ELazy-loading',
        errorClass: 'ELazy-error',
        debug: false,
        placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC'
    };


    function ELazyload($element, options) {
        this.$el = $element;

        this.settings = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name = EPluginName;

        this.init();
    }

    ELazyload.prototype = {
        init: function() {
            this.$imgs = this.$el.find('['+ this.settings.source +']');
            this.$w = $(window);
            this.total = this.$imgs.length;

            // 加载完一个添加一个标识，用来判断是否全部加载完成
            this.loaded = [];

            this.check(this.$imgs);
            this.bindEvent();
        },

        bindEvent: function($img) {
            var _this = this;

            if ( $img ) {
                $img.get(0).onload = function() {
                    $img.removeClass(_this.settings.loadingClass);
                    $img.data('loaded', true);

                    _this.loaded.push(1);
                };

                $img.get(0).onerror = function() {
                    $img.removeClass(_this.settings.loadingClass)
                    .addClass(_this.settings.errorClass);
                    $img.data('loaded', false);
                };
            } else {
                this.$w.unbind('scroll.lazyimg resize.lazyimg')
                .bind('scroll.lazyimg resize.lazyimg', function() {
                    _this.check(_this.$imgs);
                })
            }
        },

        check: function($images) {
            var _this = this;

            // 剩余未加载的图片
            var $imgsUnloaded = $();

            function load($img) {
                $img.attr('src', $img.attr(_this.settings.source));
            }

            $images.each(function() {
                var $this = $(this);

                if ( !$this.data('loaded') ) {
                    $this.addClass(_this.settings.loadingClass);
                    $this.data('loaded', !!$this.attr('src'));

                    _this.bindEvent($this);
                }

                if ( _this.inWindow($this) ) {
                    load( $this );
                } else {
                    $imgsUnloaded = $imgsUnloaded.add($this);
                }
            });


            // 重置查询范围
            this.$imgs = $imgsUnloaded;

            if ( this.settings.debug ) {
                console.log( 'Total:' + this.total
                            + '\u3000 current:' + $images.length
                            + '\u3000 Left: ' + $imgsUnloaded.length );
            }

            if ( this.total === this.loaded.length ) {
                this.$w.unbind('scroll.lazyimg resize.lazyimg')

                if ( this.settings.debug ) {
                    console.log('All done.');
                }
            }
        },

        inWindow: function($img) {
            var wHeight = this.$w.height();
            var scrollTop = $('body').scrollTop() || $('html').scrollTop();
            var imgTop= $img.offset().top;

            return imgTop < wHeight + scrollTop + this.settings.threshold && imgTop > scrollTop;
        }

    };


    $.fn[EPluginName] = function (options) {
        if ( !this.length ) {
            console.error('The elements['+ this.selector +'] you passed is empty.');
            return this;
        } else {
            return this.each(function () {
                var EPluginInstance = new ELazyload($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
