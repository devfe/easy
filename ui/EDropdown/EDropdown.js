/* ------------------------------------------------------------------------
 * @Name: EDropdown
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * GPL v3 license. © 2015 JD Inc.
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
        current: 'current',
        autoClose: false,
        delay: 100,
        head: '[data-drop="head"]',
        // 用于菜单内容在外部的情况「触发点与内容层无html嵌套关系」
        content: null,
        onOpen: emptyFunction,
        onTrigger: emptyFunction
    };

    function EDropdown($element, options) {
        this.$el = $element;

        this.settings = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name = EPluginName;
        this._version  = EPluginVersion;

        this.init();
    }

    EDropdown.prototype = {
        init: function() {
            this.$el.attr('data-role', 'drop');
            this.isMouseEvt =  /mouse/.test(this.settings.event);

            this.timer = null;

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
            var enterEvent = 'mouseenter';
            var exitEvent  = 'mouseleave';

            if ( this.isMouseEvt ) {
                this.$triggers.each(function() {
                    var $this = $(this);

                    $this.unbind(enterEvent)
                    .bind(enterEvent, function() {
                        _this.handleEvent( $(this), false );
                    })
                    .bind(exitEvent, function() {
                        _this.handleEvent( $(this), true );
                    });
                });

                if (this.settings.content) {
                    var eventTrigger = [
                        this.settings.event,
                        EPluginName,
                        $.fn[EPluginName + '_guid']
                    ].join('.');

                    $(document).undelegate(eventTrigger)
                    .delegate(this.settings.content, eventTrigger, function() {
                        clearTimeout(_this.timer);
                    });
                    $(document).undelegate(exitEvent)
                    .delegate(this.settings.content, exitEvent, function() {
                        _this.handleEvent( $(this), true );
                    });
                }
            } else {
                this.$triggers.unbind('click')
                .bind('click', function() {
                    var $this = $(this);
                    var $wrap = $this.attr('data-role')
                        ? $this
                        : $this.parents('[data-role="drop"]').eq(0);

                    _this.trigger($wrap, !!$wrap.data('open'));
                });
            }
        },

        handleEvent: function($ele, isOpen) {
            // 收起/关闭的时候不加延迟
            // this.settings.delay = isOpen ? 0 : this.settings.delay;

            // if ( isOpen ) { clearTimeout(this.timer); }
            if ( !this.isMouseEvt ) {
                this.settings.delay = 0;
            }

            if ( this.settings.content ) {
                // content元素只能选择一个，如果弹出内容元素在$el外部，反查传入jQuery对象个数，也只能有1个
                if ( $(this.settings.content).length !== 1
                    ||  this.$el.length !== 1  ) {
                    console.log('「' + EPluginName + '」 Content & jQuery element should be juse select only one element.');
                }
            }
            this.delay($ele, isOpen);
        },

        delay: function($ele, isOpen) {
            var _this = this;

            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                _this.trigger($ele, isOpen);
            }, this.settings.delay);
        },

        trigger: function($ele, isOpen) {
            if ( !isOpen ) {
                $ele.addClass(this.settings.current)
                .data('open', true);

                if ( this.settings.content ) {
                    $(this.settings.content).show();
                }
            } else {
                $ele.removeClass(this.settings.current)
                .removeData('open');

                if ( this.settings.content ) {
                    $(this.settings.content).hide();
                }
            }

            this.settings.onTrigger.call(this, $ele);
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

                var EPluginInstance = new EDropdown($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
