/* ------------------------------------------------------------------------
 * @Name: Plugins
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * GPL v3 license. © 2015 JD Inc.
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符 Plugins 即可
    var EPluginName = 'Plugins';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function() {};

    // 插件参数默认值
    var defaults = {
        propertyName: 'value'
    };

    function Plugins($element, options) {
        this.$el = $element;

        this.settings = $.extend(true, {}, defaults, options) ;

        this._defaults = defaults;
        this._name = EPluginName;
        this._version  = EPluginVersion;

        this.init();
    }

    Plugins.prototype = {
        init: function() {

        },

        pluginMethod: function() {

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

                var EPluginInstance = new Plugins($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
