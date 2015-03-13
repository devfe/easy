/* ------------------------------------------------------------------------
 * @Name: ECalendar
 * @Author: keelii
 * @Version: 1.0.0
 * ------------------------------------------------------------------------
 * Copyright 2015-2015 JD, Inc. Licensed under MIT
 * ------------------------------------------------------------------------ */

(function ($, window, document) {
    'use strict';
    // 插件名称：新建插件全局替换字符 ECalendar 即可
    var EPluginName = 'ECalendar';

    // 插件版本
    var EPluginVersion = '@VERSION';

    var emptyFunction = function() {};

    // 插件参数默认值
    var defaults = {
        id: null,
        // The day JavaScript born
        start: '1995-5-1',
        // Last day
        end: '2043-5-1',
        outputFormat: '{Y}-{M}-{D}',
        weekName: ['日', '一', '二', '三', '四', '五', '六'],
        today: true,
        hoverClass: 'ECal-hover',
        currentDay: 'ECal-active',
        close: false,
        curr: new Date(),
        selector: {
            trigger : '[data-date]',
            sYear   : '[data-cal="sYear"]',
            sMonth  : '[data-cal="sMonth"]',
            switcher: '[data-switch]',
            week    : '[data-cal="week"]',
            body    : '[data-cal="body"]',
            close   : '[data-cal="close"]'
        },
        template: {
            trigger: '<span class="ECal-week{WEEK} ECal-date{DATE}" data-date="{DATE}">{DATE}</span>',
            wrap   : '\
                <div id="{ID}" class="ECal">\
                    <div class="ECal-change">\
                        <span data-switch="py" class="ECal-switch prev-year"> « </span>\
                        <span data-switch="pm" class="ECal-switch prev-month"> ‹ </span>\
                        <span class="ECal-select-year">\
                            <select data-cal="sYear" name=""></select>\
                        </span>\
                        <span class="ECal-select-month">\
                            <select data-cal="sMonth" name=""></select>\
                        </span>\
                        <span data-switch="nm" class="ECal-switch next-month"> › </span>\
                        <span data-switch="ny" class="ECal-switch next-year"> » </span>\
                    </div>\
                    <div data-cal="week" class="ECal-weeks"></div>\
                    <div data-cal="body" class="ECal-body"></div>\
                    <div class="ECal-footer">\
                        <span class="ECal-today">今天</span>\
                        <em data-cal="close" class="ECal-close">&times;</em>\
                    </div>\
                </div>',
            empty : '<span class="ECal-date">&nbsp;</span>',
            week  : '<span class="ECal-weekname{NUM}">{WNAME}</span>'
        },
        onReady  : emptyFunction,
        onChoose : emptyFunction
    };

    function ECalendar($element, options) {
        this.$el       = $element;

        this.settings  = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name     = EPluginName;
        this._guid     = $element.data('Eguid');

        this.init();
    }

    ECalendar.prototype = {
        init: function() {
            var TPL = this.settings.template.wrap;

            if ( !this.settings.id ) {
                throw new Error( '「' + EPluginName + '」 The calendar`s id should be given a uniq String' );
            }

            if ( $('#' + this.settings.id).length < 1 ) {
                TPL = TPL.replace('{ID}', this.settings.id);
                $('body').eq(0).append( TPL );
            }

            // elements
            this.$cal       = $('#' + this.settings.id);
            this.$sYear     = this.$cal.find(this.settings.selector.sYear);
            this.$sMonth    = this.$cal.find(this.settings.selector.sMonth);
            this.$switcher  = this.$cal.find(this.settings.selector.switcher);
            this.$close     = this.$cal.find(this.settings.selector.close);

            this.triggerAttr = this.settings.selector.trigger.replace(/\[|\]/g, '');

            this.current     = this.formatDate(this.settings.curr);

            // 记录高亮显示「已选择」的时间
            this.highLight   = this.formatDate(this.settings.curr);

            // 初始化日历位置
            this.initStyle();

            // 设置年份月份选择下拉框
            this.renderSelect(this.current);

            // 渲染当前周
            this.renderWeek(this.current);

            // 渲染当前日期
            this.renderDate();

            // 绑定事件
            this.bindEvent();

            if ( this.settings.close ) {
                this.$close.show();
            }

            this.settings.onReady.call(this);
        },

        bindEvent: function() {
            var _this = this;
            var changeEvt = [
                'change',
                EPluginName,
                this.Eguid
            ];

            var changeEvtSelector = [
                this.settings.selector.sYear,
                this.settings.selector.sMonth
            ];
            var clickEvtSelector = [
                this.settings.selector.switcher,
                this.settings.selector.close
            ];

            var switcherAttr = this.settings.selector.switcher.replace(/\[|\]/g, '');

            this.$cal.undelegate('change')
            .delegate(changeEvtSelector.join(','), 'change', function () {
                _this.renderDate();
            });

            this.$cal.undelegate('click')
            .delegate(clickEvtSelector.join(','), 'click', function () {
                var sign = $(this).attr(switcherAttr);

                if ( $(this).is(_this.settings.selector.switcher) ) {
                    _this.goTo(sign);
                }
                if ( $(this).is(_this.settings.selector.close) ) {
                    _this.hide();
                }
            });

            this.$el.bind('click', function() {
                _this.show();
                return false;
            });

            this.$cal.bind('click', function(e) {
                var el = $(e.target);
                var date = parseInt(el.attr(_this.triggerAttr));
                var now = _this.formatDate(new Date());

                if (el.attr(_this.triggerAttr)) {
                    _this.chooseDate(date);
                }
                if (_this.settings.today && el.hasClass('ECal-today')) {
                    _this.$sYear.val(now.year);
                    _this.$sMonth.val(now.month);
                    _this.current.year = now.year;
                    _this.current.month = now.month;
                    _this.chooseDate(now.date);
                    _this.hide();
                }

                return false;
            });
            //this.$cal.hover(function(e) {
                //var el = $(e.target);
                //if (el.attr('data-date')) {
                    //$(this).addClass(_this.settings.hoverClass);
                //}
            //}, function() {
                //$(this).removeClass(_this.settings.hoverClass);
            //});

            $(document).unbind()
            .bind('click', function() {
                _this.hide();
            });
        },

        initStyle: function() {
            var el    = this.$el;
            var h     = el.outerHeight();
            var oLeft = el.offset().left;
            var oTop  = el.offset().top;

            this.$cal.css({
                top: oTop + h,
                left: oLeft
            });
        },

        formatDate: function(fullDate) {
            var dateRe = /\d{4}-\d{1,2}-\d{1,2}/;
            var dateArr;
            var now;

            if ( typeof fullDate === 'string' ) {
                if( !dateRe.test(fullDate) ) {
                    throw new Error('「' + EPluginName + '」 Illegal date string :`' + currTimeString + '`.');
                } else {
                    dateArr = fullDate.split('-');
                    now = new Date(dateArr[0], parseInt(dateArr[1]) - 1, dateArr[2])
                }
            } else {
                now = fullDate;
            }

            var currYear  = now.getFullYear();
            var currMonth = now.getMonth() + 1;
            var currDate  = now.getDate();
            var currDay   = now.getDay();

            // 当前时间头一天是星期几
            var firstDay = new Date(currYear, currMonth - 1, 1).getDay();

            return {
                year: currYear,
                month: currMonth,
                date: currDate,
                day: currDay,
                firstDay: firstDay
            };
        },
        isLeapYear: function(year) {
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
        },
        outputDate: function (d) {
            return this.settings.outputFormat
                    .replace('{Y}', d.year)
                    .replace('{M}', d.month)
                    .replace('{D}', d.date);
        },

        show: function() {
            this.$cal.show()
            this.markSelected();
        },
        hide: function() {
            this.$cal.hide()
        },

        markSelected: function() {
            var year   = this.current.year;
            var month  = this.current.month;
            var hYear  = this.highLight.year;
            var hMonth = this.highLight.month;
            var hDate  = this.highLight.date;

            this.$cal.find(this.settings.selector.trigger)
            .removeClass(this.settings.currentDay);

            if ( year === hYear && month === hMonth ) {
                this.$cal.find('['+ this.triggerAttr +'="'+ hDate +'"]').addClass(this.settings.currentDay);;
            }
        },
        chooseDate: function(date) {
            this.updateCurrent();
            this.current.date = date;

            this.$el.val(this.outputDate(this.current));
            this.highLight = $.extend(true, {}, this.current);

            this.hide();
            this.settings.onChoose.call(this, this.current);
        },
        goTo: function(dir) {
            if (dir === 'py') {
                if (this.current.year - 1 >= this.yearHead) {
                    this.$sYear.val(--this.current.year);
                }
            } else if (dir === 'pm') {
                if (this.current.month - 1 >= 1) {
                    this.$sMonth.val(--this.current.month);
                }
            } else if (dir === 'ny') {
                if (this.current.year + 1 <= this.yearTail) {
                    this.$sYear.val(++this.current.year);
                }
            } else if (dir === 'nm') {
                if (this.current.month + 1 <= 12) {
                    this.$sMonth.val(++this.current.month);
                }
            }
            this.renderDate();
        },
        updateCurrent: function() {
            this.current.year     = parseInt(this.$sYear.val());
            this.current.month    = parseInt(this.$sMonth.val());
            this.current.day      = 1;
            this.current.firstDay = new Date(this.current.year, this.current.month - 1, 1).getDay();
        },


        renderSelect: function(fullDate) {
            var yearOptionHtml  = '';
            var monthOptionHtml = '';

            var start = this.formatDate(this.settings.start);
            var end   = this.formatDate(this.settings.end);

            // 年、月开始结束范围
            this.yearHead  = start.year;
            this.monthHead = start.month;
            this.yearTail  = end.year;
            this.monthTail = end.month;

            for (var i = start.year; i <= end.year; i++) {
                yearOptionHtml += ('<option value="'+ i +'">'+ i +'</option>');
            }
            for (var k = 1; k < 13; k++) {
                monthOptionHtml += ('<option value="'+ k +'">'+ k +'</option>');
            }

            this.$sYear.html(yearOptionHtml)
                        .val(fullDate.year);
            this.$sMonth.html(monthOptionHtml)
                        .val(fullDate.month);

            this.$el.val(this.outputDate(this.current));
        },

        getFullDateCount: function(fullDate) {
            var dateRe       = new RegExp('-' + fullDate.month + '-');
            var month31      = '-1-3-5-7-8-10-12-';
            var febDateCount = this.isLeapYear(fullDate.year) ? 29 : 28;

            if (dateRe.test(month31)) {
                return 31;
            } else if (fullDate.month == 2) {
                return febDateCount;
            } else {
                return 30;
            }
        },
        renderWeek: function(date) {
            var weekName = this.settings.weekName;
            var len      = weekName.length;
            var weekEl   = this.$cal.find(this.settings.selector.week);
            var resHTML  = '';

            var tplWeek = this.settings.template.week;

            for (var i = 0; i < len; i++) {
                resHTML += tplWeek.replace(/\{NUM\}/g, i)
                            .replace(/\{WNAME\}/g, weekName[i]);
            }

            weekEl.html(resHTML);
        },
        renderDate: function(d) {
            var i, j, dateCount,
                k = 1,
                dateHTML = '',
                date;

            var tplEmpty = this.settings.template.empty;
            var tplTirgger = this.settings.template.trigger;

            if (typeof d !== 'undefined') {
                date = this.formatDate(d);
            } else {
                date = this.current;
            }

            this.updateCurrent();

            dateCount = this.getFullDateCount(date);

            dateHTML += '<ul>';
            for (var i = 0; i < 6; i++) {
                dateHTML += '<li>';

                for (var j = 0; j < 7; j++) {
                    if (k > dateCount) {
                        dateHTML += tplEmpty
                    } else {
                        if (i == 0) {
                            if (j > date.firstDay-1) {
                                dateHTML += tplTirgger.replace(/\{WEEK\}/g, j)
                                            .replace(/\{DATE\}/g, k);

                                k++;
                            } else {
                                dateHTML += tplEmpty;
                            }
                        } else {
                            dateHTML += tplTirgger.replace(/\{WEEK\}/g, j)
                                        .replace(/\{DATE\}/g, k);
                            k++;
                        }
                    }
                }

                dateHTML += '</li>';
            }
            dateHTML += '</ul>';

            this.$cal.find(this.settings.selector.body).html(dateHTML);
            this.markSelected();
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

                var EPluginInstance = new ECalendar($(this), options);

                if ( !$(this).data(EPluginName) ) {
                    $(this).data(EPluginName, EPluginInstance);
                }

            });
        }
    };
})(jQuery, window, document);
