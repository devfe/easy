# 延迟加载

## 示例

### HTML

    <!-- 图片后加载 -->
    <div id="lazyload-img">
        <img data-src="http://img12.360buyimg.com/n4/jfs/t286/247/1804542634/153227/c9885ca/54422bcfN6d6b5fe0.jpg">
        <img data-src="http://img12.360buyimg.com/n4/jfs/t298/55/245046980/171632/9f73afc4/5406dd74N936674f2.jpg">
        <img data-src="http://img12.360buyimg.com/n4/jfs/t217/175/2044410654/457825/a4b93e77/54055b5cN00fe600a.jpg">
        <img data-src="http://img12.360buyimg.com/n4/jfs/t667/242/231517560/150553/c65a7bd3/5458e08cN43d2801e.jpg">
    </div>


    <!-- 模块后加载 -->
    <div class="ELazyload-mod">
      <div style="height:1000px;" class="div">占位元素，下拉触发模块后加载</div>
      <div style="height:300px" class="mod">后加载的模块</div>
      <div style="height:300px;display:none;background:#ccc;" class="mod">后加载的隐藏模块</div>
    </div>

### JavaScript

    // 图片后加载
    $('#lazyload-img').ELazyload();

    // 模块后加载
    $('.mod').ELazyload({
        type: 'module',
        onAppear: function() {
            console.log('Module appear...');
            console.log(this.$el.get(0));
        }
    });

## 参数

名称         | 类型     | 默认值                | 说明
-----        | -----    | -----                 | -----
delay        | Number   | 50                    | 页面滚动延迟检测图片
type         | String   | 'img'                 | 类型：图片/模块
source       | String   | 'data-src'            | 目标检测元素html属性
removeSource | Boolean  | true                  | 目标出现后是否移除 source 属性
threshold    | Number   | 0                     | 目标出现距离阀值
loadingClass | String   | 'ELazy-loading'       | 图片加载中 css class 属性
errorClass   | String   | 'ELazy-error'         | 图片加载失败时 css class 属性
debug        | Boolean  | false                 | 开启调试模式
placeholder  | Array    | ['img', 'imgDataURI'] | 默认图片点位符：[0] => 图片地址， [1] => DataURI 字符串
onAppear     | Function | emptyFunction         | 目标元素出现回调
onReady      | Function | emptyFunction         | 组件初始化完成
onComplete   | Function | emptyFunction         | 所有的目标都出现过回调
onError      | Function | emptyFunction         | 图片加载出错回调(单个)
onLoad       | Function | emptyFunction         | 图片加载完成回调(单个)


## 方法

### .check($images)

判断图片是否在可视窗口范围内并进行操作

### .inWindow($el)

判断元素是否在可视窗口范围

### .supportClientRect()

判断高级浏览器支持元素坐标方法
