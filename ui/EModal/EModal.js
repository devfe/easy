/* ------------------------------------------------------------------------
 * @Name: EModal
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * GPL v3 license. © 2015 JD Inc.
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符 EModal 即可
    var EPluginName = 'EModal';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function() {};

    /*



    */

    var wrap = '\
        <div id="{id}" class="EModal" data-role="EModal">\
            <div class="EModal-title">{title}</div>\
            <div class="EModal-content">{content}</div>\
        </div>';


    // 插件参数默认值
    var defaults = {
        id: null,
        type: 'html',
        content: '',
        hasOverLay: true,
        template: {
            title: '提示',
            wrap: wrap,
            overLay: '<div data-modal="overlay"></div>',
            iframe: '<iframe src="{src}" marginwidth="0" marginheight="0" frameborder="0" scrolling="no"></iframe>'
        },
        selector: {
            trigger : '[data-modal="trigger"]',
            content : '[data-modal="content"]',
            close   : '[data-modal="close"]',
            ok      : '[data-modal="ok"]',
            cancel  : '[data-modal="cancel"]',
        },
        onReady: emptyFunction,
        onClose: emptyFunction,
        onCancel: emptyFunction,
        onOk: emptyFunction,
    };

    function EModal($element, options) {
        this.$el       = $element;

        this.settings  = $.extend(true, {}, defaults, options) ;

        this._defaults = defaults;
        this._name     = EPluginName;
        this._version  = EPluginVersion;
        this._guid     = $element.data('Eguid');

        this.init();
    }

    EModal.prototype = {
        init: function() {
            var selector = this.settings.selector;

            this.$body = $('body');

            this.$trigger = $(selector.trigger);

            this.bindEvent();

        },

        render: function () {
            var hasOverLay = $('[data-modal="overlay"]').length > 0;

            if ( this.settings.hasOverLay && !hasOverLay ) {
                this.$overLay.appendTo( this.$body );
            }

            // 已经存在元素/重复初始化 > 报错
            if ( $(this.settings.id).length > 0 ) {
                throw new Error('There is another element called ' + this.settings.id, 'Please change one.');
            }

            var id      = id || 'EModal-' + this._guid;

            var result  = this.template.wrap.replace('{id}', id);
            var title   = this.template.title;
            var content = this.getContent(this.settings.type);

            result = result.replace('{title}', title);
            result = result.replace('{content}', content);

            this.$body.append(result);

            this.$modal = $(id);

            this.bindEvent(this.$modal);
        },

        bindEvent: function($ele) {
            var s = this.settings;
            var closeSelector = s.selector.close;

            this.$trigger.bind('open', this.handleOpen);

            if ( $ele ) {
                $ele.unbind()
                .bind('close', this.close)
                .bind('ok', this.ok);
            }
        },

        handleOpen: function () {

            this.render();

            this.open();

        },

        open: function () {

        },

        close: function () {

        },
        ok: function () {

        },

        getContent: function () {
            var s = this.settings;
            var result = s.content;

            if ( type === 'iframe' ) {
                result = s.template.iframe.replace('{src}', s.content);
            }

            return result;
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

                var EPluginInstance = new EModal($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
