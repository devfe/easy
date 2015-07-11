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

    // 插件参数默认值
    var defaults = {
        id: null,
        type: 'html',
        title: null,
        content: '',
        width: 300,
        fixed: true,
        countdown: false,
        autoClose: false,
        btnOkText: '确定',
        btnCancelText: '取消',
        hasOverLay: true,
        keyBinding: true,
        template: {
            wrap     : '<div id="{id}" class="EModal" data-role="EModal">{title}{content}{button}{countdown}</div>',
            title    : '\
                <div class="EModal-title">\
                    <strong>{title}</strong>\
                    <span data-modal="close"> × </span>\
                </div>',
            content  : '<div class="EModal-content">{content}</div>',
            alert    : '\
                <div class="EModal-btns">\
                    <a href="#none" data-modal="ok" class="EModal-btn EModal-ok">{btnOkText}</a>\
                </div>',
            confirm  : '\
                <div class="EModal-btns">\
                    <a href="#none" data-modal="ok" class="EModal-btn EModal-ok">{btnOkText}</a>\
                    <a href="#none" data-modal="cancel" class="EModal-btn EModal-cancel">{btnCancelText}</a>\
                </div>',
            countdown: '<strong data-modal="countdown">{s}</strong>秒后自动关闭',
            overlay  : '<div class="EModal-overlay" data-modal="overlay"></div>',
            iframe   : '<iframe src="{src}" marginwidth="0" marginheight="0" frameborder="0" scrolling="no"></iframe>'
        },
        selector: {
            trigger   : '[data-modal="trigger"]',
            content   : '[data-modal="content"]',
            close     : '[data-modal="close"]',
            ok        : '[data-modal="ok"]',
            cancel    : '[data-modal="cancel"]',
            overlay   : '[data-modal="overlay"]',
            countdown : '[data-modal="countdown"]'
        },
        onReady: emptyFunction,
        onClose: emptyFunction,
        onCancel: emptyFunction,
        onOk: emptyFunction
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
            var template     = settings.template;

            var BTN_OK       = 'btnOkText';
            var BTN_CANCEL   = 'btnCancelText';

            this.$body       = $('body');

            this.$trigger    = this.$el;
            this.$overlay    = $(settings.template.overlay);

            // n秒自动关闭计时器
            this.timer       = null;

            // 是否已经打开
            this.opened        = false;

            template.alert   = template.alert.replace('{'+ BTN_OK +'}', settings[BTN_OK]);
            template.confirm = template.confirm
                .replace('{'+ BTN_CANCEL +'}', settings[BTN_CANCEL])
                .replace('{'+ BTN_OK +'}', settings[BTN_OK]);

            // 已经存在元素/重复初始化 > 报错
            if ( $('#' + settings.id).length ) {
                console.log('There is another element called ' + settings.id, 'Please change one.');
            } else {
                this.bindEvent();
            }

        },

        open: function ($trigger) {
            var settings   = this.settings;
            var selector   = settings.selector;
            var template   = settings.template;

            var id         = id || 'EModal-' + this._guid;
            var hasOverLay = $(selector.overlay).length > 0;

            // 遮罩层只需要插入一个
            if ( settings.hasOverLay && !hasOverLay ) {
                this.$body.append( this.$overlay );
            }

            var content = this.getHTML(settings.type).content;
            var button  = this.getHTML(settings.type).button;

            var title   = settings.title
                ? template.title.replace(/\{title\}/g, settings.title)
                : '';
            var countdown = settings.countdown
                ? template.countdown.replace(/\{s\}/g, settings.countdown)
                : '';

            var hasBtn  = /alert|confirm/.test( settings.type );

            var result  = template.wrap.replace(/\{id\}/g, id);

            result = result.replace(/\{content\}/g, content);
            result = result.replace(/\{title\}/g,  title);
            result = result.replace(/\{button\}/g, hasBtn ? button : '');
            result = result.replace(/\{countdown\}/g, countdown);

            this.$modal = $(result);
            this.$body.append(this.$modal);
            this.setPos(this.$modal);
            this.setDrag(this.$modal);

            this.opened = true;

            if ( settings.countdown ) {
                this.$countdown = this.$modal.find(selector.countdown);
                this.countdown(this.$countdown);
            }

            this.bindEvent(this.$modal);
        },

        bindEvent: function($ele) {
            var _this      = this;
            var settings   = _this.settings;
            var selector   = settings.selector;
            var keyDownEvt = ['keydown', this._name, this._guid].join('.');

            if ( $ele ) {
                $ele.undelegate()
                .delegate(selector.close, 'click', function() {
                    _this.close();
                })
                .delegate(selector.cancel, 'click', function() {
                    _this.cancel();
                })
                .delegate(selector.ok, 'click', function() {
                    _this.ok();
                });

                if ( settings.autoClose ) {
                    _this.$overlay
                    .unbind('click')
                    .bind('click', function() {
                        _this.close();
                    });
                }

                if ( settings.keyBinding ) {
                    $(document).unbind(keyDownEvt)
                    .bind(keyDownEvt, function (e) {
                        _this.bindKey(e.keyCode);
                    });
                }
            } else {
                _this.$trigger.bind('open', function() {
                    _this.open( $(this) );
                });

                _this.$trigger.click(function () {
                    $(this).trigger('open');
                    this.blur();
                    _this.$modal[0].focus();
                });
            }
        },

        bindKey: function (keyCode) {
            if ( !this.opened ) return;

            if ( keyCode === 27 ) this.cancel();
            if ( keyCode === 13 ) this.ok();
        },

        setDrag: function ($ele) {
            var $body     = this.$body;
            var mousedown = false;

            var elX       = $ele.offset().left;
            var elY       = $ele.offset().top;
            var elW       = $ele.outerWidth();
            var elH       = $ele.outerHeight();
            var startX, startY;

            function move(evt, $tar) {
                var exX     = evt.clientX - startX;
                var exY     = evt.clientY - startY;
                var bWidth  = $body.outerWidth();
                var bHeight = $body.outerHeight();

                if ( exX > bWidth - elX - elW ) {
                    exX = bWidth - elX - elW;
                }
                if ( exY > bHeight - elY - elH ) {
                    exY = bHeight - elY - elH;
                }

                $tar.css({
                    position: 'absolute',
                    left: elX + exX,
                    top: elY + exY,
                    margin: 0
                });
            }

            $ele.bind('mousedown', function (e) {
                mousedown = true;
                startX = e.clientX;
                startY = e.clientY;

                elX = $ele.offset().left;
                elY = $ele.offset().top;
            });
            $ele.bind('mouseup', function () {
                mousedown = false;
                elX = $ele.offset().left;
                elY = $ele.offset().top;
            });
            $ele.bind('mousemove', function (e) {
                if ( mousedown ) {
                    move(e, $ele);
                }
            });
        },

        setPos: function($ele) {
            var settings = this.settings;
            var top      = - ($ele.outerHeight() / 2);
            var left     = - (settings.width / 2);

            var $body    = this.$body;
            var bML      = parseInt($body.css('margin-left'), 10);
            var bMR      = parseInt($body.css('margin-right'), 10);
            var bMT      = parseInt($body.css('margin-top'), 10);
            var bMB      = parseInt($body.css('margin-bottom'), 10);

            var modalStyle = {
                'width': settings.width,
                'margin-left': left
            };

            if ( settings.fixed ) {
                this.$modal.addClass('EModal-fixed');
            }

            this.$modal.css(modalStyle);
            $ele.css('margin-top', top);

            this.$overlay.css({
                width: $body.outerWidth() + bML + bMR,
                height: $body.outerHeight() + bMT + bMB
            });
        },

        close: function () {
            this.opened = false;

            this.$modal.remove();
            this.$overlay.remove();

            this.settings.onClose.call(this);

            clearInterval(this.timer);
        },
        ok: function () {
            this.close();
            this.settings.onOk.call(this);
        },
        cancel: function() {
            this.close();
            this.settings.onCancel.call(this);
        },

        getHTML: function (type) {
            var settings = this.settings;
            var template = settings.template;

            var content = template.content.replace(/\{content\}/g, settings.content);
            var button = '';

            if ( type === 'iframe' ) {
                var iframe = template.iframe.replace(/\{src\}/g, settings.content);
                content = template.content.replace(/\{content\}/g, iframe);
            } else if ( type === 'alert' ) {
                button = template.alert.replace(/\{btnOkText\}/g, settings.btnOkText);
            } else if ( type === 'confirm' ) {
                button = template.confirm
                     .replace(/\{btnOkText\}/g, settings.btnOkText)
                     .replace(/\{btnCancelText\}/g, settings.btnCancelText);
            }

            return {
                content: content,
                button: button
            };
        },

        countdown: function($ele) {
            var _this = this;
            var countdown = _this.settings.countdown;

            _this.timer = setInterval(function() {

                if ( countdown < 1 ) {
                    _this.close();
                } else {
                    $ele.html( --countdown );
                }

            }, 1000);
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

                var EPluginInstance = new EModal($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
