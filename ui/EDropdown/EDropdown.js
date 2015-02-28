/* ------------------------------------------------------------------------
 * @Name: EDropdown
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * Copyright 2015-2015 JD, Inc. Licensed under MIT
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符EDropdown即可
    var EPluginName = 'EDropdown';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function() {};

    // 插件参数默认值
    var defaults = {
        event: 'mouseenter',
        trigger: null,
        current: 'active',
        autoClose: false,
        head: '[data-drop="head"]',
        content: '[data-drop="content"]',
        onOpen: emptyFunction,
        onClose: emptyFunction
    };

    function EDropdown($element, options) {
        this.$el = $element;

        this.settings = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name = EPluginName;

        this.init();
    }

    EDropdown.prototype = {
        init: function() {
            this.$el.attr('data-role', 'drop');

            if ( this.settings.event === 'click' && !this.settings.autoClose ) {
                this.settings.trigger = this.$el.find(this.settings.head);
            }

            this.$triggers = this.settings.trigger
                ? this.$el.find(this.settings.trigger)
                : this.$el;


            this.bindEvent();
        },

        bindEvent: function() {
            var _this = this;

            if ( /mouse/.test(this.settings.event) ) {
                this.$triggers.each(function() {
                    var $this = $(this);

                    $this.unbind('mouseenter')
                    .bind('mouseenter', function() {
                        _this.open( $(this) );
                    })
                    .bind('mouseleave', function() {
                        _this.close( $(this) );
                    });
                });
            } else {
                this.$triggers.unbind('click')
                .bind('click', function() {
                    var $this = $(this);
                    var $wrap = $this.attr('data-role')
                        ? $this
                        : $this.parents('[data-role="drop"]').eq(0);

                    console.log($wrap);
                    if ( $wrap.data('open') ) {
                        _this.close( $wrap );
                    } else {
                        _this.open( $wrap );
                    }
                });
            }
        },

        open: function($ele) {
            $ele.addClass(this.settings.current)
            .data('open', true);
            this.settings.onOpen.call(this, $ele);
        },

        close: function($ele) {
            $ele.removeClass(this.settings.current)
            .removeData('open', true);
            this.settings.onClose.call(this, $ele);
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

                var EPluginInstance = new EDropdown($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
