(($, window, document) ->
    #  // 插件名称：新建插件全局替换字符 ETooltips 即可
    EPluginName = 'ETooltips';

    #  // 插件版本
    EPluginVersion = '@VERSION';

    class ETooltips
        @defaults =
            event: 'mouseover'
            pos: 'right'
            close: true
            width: null
            content: null
            id: 'ETooltips-{uid}'
            x: 0
            y: 0
            zIndex: null
            rmTitle: true  # 初始化后是否移除tirgger上的title属性，防止默认的title与tooltips重合
            template: '
            <div class="ETooltips ETooltips-{pos}">
                <div class="ETooltips-arr"></div>
                <div class="ETooltips-close" data-tooltips="close" style="display:none;">&times;</div>
                <div class="ETooltips-con" data-tooltips="content">{content}</div>
            </div>'
            selector:
                trigger: '[data-role="tooltips"]'
                content: '[data-tooltips="content"]'
                close: '[data-tooltips="close"]'

        constructor: ($element, options) ->
            @$el = $element;
            @_name = EPluginName;
            @_version = EPluginVersion;
            @_uid = @$el.data 'Eguid';

            @settings = $.extend(true, {}, ETooltips.defaults, options);

            @init()

        init: ->
            @bindEvent();
            @insertTooltips();

        bindEvent: ->
            self = this
            $document = $ document;

            eventEnter = [
                'mouseenter',
                @_name
            ].join('.');

            eventExit = [
                'mouseleave',
                @_name
            ].join('.');

            @$el
            .unbind eventEnter
            .bind eventEnter, ->
                self.calPos()
                self.$tooltips.show()
            @$el
            .unbind eventExit
            .bind eventExit, ->
                self.$tooltips.hide()

            eventClose = [
                'click'
                @_name
                @_uid
            ].join('.');

            $document
            .undelegate eventClose
            .delegate @.settings.selector.close, eventClose, ->
                self.$tooltips.hide()

        calPos: ->
            oTop   = @$el.offset().top;
            oLeft  = @$el.offset().left;
            width  = @$el.outerWidth();
            height = @$el.outerHeight();

            ARROW_WIDTH = 5;
            settings = this.settings;

            switch settings.pos
                when 'top'
                    oTop  = oTop  + settings.y - this.height - ARROW_WIDTH
                    oLeft = oLeft + settings.x
                when 'right'
                    oTop  = oTop  + settings.y
                    oLeft = oLeft + settings.x + width + ARROW_WIDTH
                when 'bottom'
                    oTop  = oTop  + settings.y + height + ARROW_WIDTH
                    oLeft = oLeft + settings.x
                when 'left'
                    oTop  = oTop  + settings.y
                    oLeft = oLeft + settings.x - this.width - ARROW_WIDTH
                else
                    throw new Error '[Pos]ition not given.'

            this.$tooltips.css {
                top : oTop,
                left: oLeft
            };

        insertTooltips: ->
            settings = @settings;
            id = settings.id.replace '{uid}', this._uid
            $tooltips = $ '#' + id

            if $tooltips.length
                false

            content = settings.content || @$el.attr 'title' || '[error] title or content not given.'
            tipsHTML = settings.template
                .replace '{pos}', settings.pos
                .replace '{content}', content

            @$tooltips = $ tipsHTML

            @$tooltips.attr 'id', id
            $ 'body'
                .append(@$tooltips)

            @$tooltips.find settings.selector.close
                .show() if settings.close

            @$el.remove 'title' if settings.rmTitle

            style = {}
            style['width'] = settings.width if settings.width
            style['z-index'] = settings.zIndex if settings.zIndex

            @$tooltips.css style
            @width = @$tooltips.outerWidth()
            @height = @$tooltips.outerHeight()

        setContent: (content) ->
            @$tooltips.find @settings.selector.content
                .html content

    #    // 多组件初始化防止事件namespace冲突
    $.fn[EPluginName + '_guid'] = 0;
    $.fn[EPluginName] = (options) ->
        if !@length
            console.log "「#{ EPluginName }」 The elements[#{@selector}] you passed is empty.";
        else
            @each ->
                $this = $(this);
                $this.data 'Eguid', $.fn[EPluginName + '_guid']++

                EPluginInstance = new ETooltips($(this), options);
                if !$this.data EPluginName
                    $this.data EPluginName, EPluginInstance

) jQuery, window, document