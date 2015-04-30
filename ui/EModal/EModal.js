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

    var wrap = '\
        ';


    // 插件参数默认值
    var defaults = {
        id: null,
        type: 'html',
        title: null,
        content: '',
        btnOkText: '确定',
        btnCancelText: '取消',
        hasOverLay: true,
        template: {
            wrap    : '<div id="{id}" class="EModal" data-role="EModal"></div>',
            title   : '<div class="EModal-title">{title}</div>',
            content : '<div class="EModal-content">{content}</div>',
            alert   : '\
                <div class="EModal-ctl">\
                    <a href="#none" data-modal="ok" class="EModal-btn EModal-ok">{btnOkText}</a>\
                </div>',
            confirm : '\
                <div class="EModal-ctl">\
                    <a href="#none" data-modal="ok" class="EModal-btn EModal-ok">{btnOkText}</a>\
                    <a href="#none" data-modal="cancel" class="EModal-btn EModal-cancel">{btnCancelText}</a>\
                </div>',
            overLay : '<div class="EModal-overlay" data-modal="overlay"></div>',
            iframe  : '<iframe src="{src}" marginwidth="0" marginheight="0" frameborder="0" scrolling="no"></iframe>'
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
            var settings     = this.settings;
            var selector     = settings.selector;
            var template     = settings.template;

            var BTN_OK       = 'btnOkText';
            var BTN_CANCEL   = 'btnCancelText';

            this.$body       = $('body');

            this.$trigger    = $(selector.trigger);
            this.$overlay    = $(settings.template.overlay);

            template.alert   = template.alert.replace('{'+ BTN_OK +'}', settings[BTN_OK]);
            template.confirm = template.confirm
                .replace('{'+ BTN_CANCEL +'}', settings[BTN_CANCEL])
                .replace('{'+ BTN_OK +'}', settings[BTN_OK]);

            // 已经存在元素/重复初始化 > 报错
            if ( $(settings.id).length ) {
                throw new Error('There is another element called ' + settings.id, 'Please change one.');
            } else {
                this.bindEvent();
            }

        },

        render: function () {
            var settings   = this.settings;
            var template   = settings.template;

            var id         = id || 'EModal-' + this._guid;
            var hasOverLay = $(settings.selector.overlay).length;

            // 遮罩层只需要插入一个
            if ( settings.hasOverLay && !hasOverLay ) {
                this.$overLay.appendTo( this.$body );
            }

            var $model  = $(template.wrap.replace('{id}', id));
            var title   = template.title.replace('{title}', settings.title);
            var content = this.getContent(settings.type);

            if ( settings.title ) {
                $model.append(title);
            }

            $model.append(content);

            this.$body.append($model);

            this.$modal = $model;

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
            var settings = this.settings;
            var template = settings.template;

            var result = template.content;

            // result = result.replace('{content}', settings.content);

            if ( type === 'iframe' ) {
                result = settings.template.iframe.replace('{src}', settings.content);
            }

            if ( type === 'alert' ) {
                result = 0;
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
