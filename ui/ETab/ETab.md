# 选项卡 tab

## 示例

### HTML

    <div class="ETab">
        <ul>
            <li data-tab="trigger" class="current">Tab 1</li>
            <li data-tab="trigger">Tab 2</li>
            <li data-tab="trigger">Tab 3</li>
        </ul>
        <div>
            <div data-tab="item">1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non purus in leo fermentum mattis id ut felis. Aenean blandit erat maximus lacus blandit pharetra. Nullam ac finibus elit. </div>
            <div data-tab="item" class="hide">2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non purus in leo fermentum mattis id ut felis. Aenean blandit erat maximus lacus blandit pharetra. </div>
            <div data-tab="item" class="hide">3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non purus in leo fermentum mattis id ut felis. Aenean blandit erat maximus lacus blandit pharetra.</div>
        </div>
    </div>

### JavaScript

    $('.Etab').Etab()

## 参数

名称          | 类型      | 默认值                  | 说明
-----         | -----     | -----                   | -----
event         | String    | 'click'                 | 触发切换事件类型
delay         | Number    | 0                       | 延迟时间
defaultIndex  | Number    | null                    | tab初始化后默认切换到第N个tab
current       | String    | 'current'               | 当前tab tirgger 高亮样式
lazyload      | Null      | null                    | 切换完tab后是否需要触发lazyload
selector      | Object    | {}                      | 选择器
 ↳ .trigger   | String    | '[data-tab="trigger"]'  | 触发元素
 ↳ .item      | String    | '[data-tab="item"]'     | 触发点对应的内容
 ↳ .anchor    | String    | '[data-anchor]'         | 锚点元素
onReady       | Function  | function(n) {}          | tab初始化完成回调, n = 当前tab下标
onSwitch      | Function  | function(n) {}          | tab切换回调, n = 当前tab下标

## 方法

### .go(n)

切换到下标为n的tab

    var tab = $('.Etab').Etab();
    tab.go(3); // 切换到第4个tab
