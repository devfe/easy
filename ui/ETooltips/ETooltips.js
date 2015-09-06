/* ------------------------------------------------------------------------
 * @Name: ETooltips
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * GPL v3 license. © 2015 JD Inc.
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符 ETooltips 即可
    var EPluginName = 'ETooltips';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function () {
    };

    // 插件参数默认值
    var defaults = {
        event   : 'mouseover',
        pos     : 'right',
        close   : true,
        width   : null,
        content : null,
        id      : 'ETooltips-{uid}',
        x       : 0,
        y       : 0,
        zIndex  : null,
        // 初始化后是否移除tirgger上的title属性，防止默认的title与tooltips重合
        rmTitle : true,
        template: '\
        <div class="ETooltips ETooltips-{pos}">\
            <div class="ETooltips-arr"></div>\
            <div class="ETooltips-close" data-tooltips="close" style="display:none;">&times;</div>\
            <div class="ETooltips-con" data-tooltips="content">{content}</div>\
        </div>',
        selector: {
            trigger: '[data-role="tooltips"]',
            content: '[data-tooltips="content"]',
            close  : '[data-tooltips="close"]'
        }
    };

    function ETooltips($element, options) {
        this.$el = $element;

        this.settings = $.extend(true, {}, defaults, options);

        this._defaults = defaults;
        this._name     = EPluginName;
        this._version  = EPluginVersion;
        this._uid      = this.$el.data('Eguid');

        this.init();
    }

    ETooltips.prototype = {
        init: function () {
            this.bindEvent();
            this.insertTooltips();
        },

        bindEvent: function () {
            var _this = this;
            var $document = $(document);

            var eventEnter = [
                'mouseenter',
                this._name
            ].join('.');
            var eventExit  = [
                'mouseleave',
                this._name
            ].join('.');

            this.$el
                .unbind(eventEnter)
                .bind(eventEnter, function () {
                    _this.calPos();
                    _this.$tooltips.show();
                });
            this.$el
                .unbind(eventExit)
                .bind(eventExit, function () {
                    _this.$tooltips.hide();
                });

            var eventClose = [
                'click',
                this._name,
                this._uid
            ].join('.');
            $document
                .undelegate(eventClose)
                .delegate(this.settings.selector.close, eventClose, function () {
                    _this.$tooltips.hide();
                });
        },

        calPos: function () {
            var oTop   = this.$el.offset().top;
            var oLeft  = this.$el.offset().left;
            var width  = this.$el.outerWidth();
            var height = this.$el.outerHeight();

            var ARROW_WIDTH = 5;
            var settings = this.settings;

            switch (settings.pos) {
                case 'top':
                    oTop  = oTop  + settings.y - this.height - ARROW_WIDTH;
                    oLeft = oLeft + settings.x;
                    break;
                case 'right':
                    oTop  = oTop  + settings.y;
                    oLeft = oLeft + settings.x + width + ARROW_WIDTH;
                    break;
                case 'bottom':
                    oTop  = oTop  + settings.y + height + ARROW_WIDTH;
                    oLeft = oLeft + settings.x;
                    break;
                case 'left':
                    oTop  = oTop  + settings.y;
                    oLeft = oLeft + settings.x - this.width - ARROW_WIDTH;
                    break;
                default:
                    throw new Error('[Pos]ition not given.');
            };

            this.$tooltips.css({
                top : oTop,
                left: oLeft
            });
        },

        insertTooltips: function () {
            var settings  = this.settings;
            var id        = this.settings.id.replace('{uid}', this._uid);
            var $tooltips = $('#' + id);

            if ($tooltips.length) {
                return false;
            }

            var content  = settings.content || this.$el.attr('title') || '[error] title or content not given.';
            var tooltips = settings.template
                .replace('{pos}', settings.pos)
                .replace('{content}', content);

            this.$tooltips = $(tooltips);

            this.$tooltips.attr('id', id);
            $('body').append(this.$tooltips);


            if (settings.close) {
                this.$tooltips.find(settings.selector.close).show();
            }
            if (settings.rmTitle) {
                this.$el.removeAttr('title');
            }

            var style = {};
            if (settings.width) { style['width'] = settings.width; }
            if ( settings.zIndex ) { style['z-index'] = settings.zIndex; }

            this.$tooltips.css(style);

            this.width  = this.$tooltips.outerWidth();
            this.height = this.$tooltips.outerHeight();

            //console.log('Width: %s | Height: %s', this.width, this.height);
        },

        setContnet: function (content) {
            this.$tooltips.find(this.settings.selector.content).html(content);
        }
    };


    // 多组件初始化防止事件namespace冲突
    $.fn[EPluginName + '_guid'] = 0;

    $.fn[EPluginName] = function (options) {
        if (!this.length) {
            console.log('「' + EPluginName + '」 The elements[' + this.selector + '] you passed is empty.');
            return this;
        } else {
            return this.each(function () {
                $(this).data('Eguid', $.fn[EPluginName + '_guid']++);

                var EPluginInstance = new ETooltips($(this), options);

                if (!$(this).data(EPluginName)) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
