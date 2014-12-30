
  前端源码分析博客
  www.cnblogs.com/AaronJs


jQuery高级程序设计目录（2.1.1版本）
-----------------------------------

  
大家最关注的问题，我能学到什么？
-----------------------------------
###  本书围绕的几个核心点：
1.	设计理念
2.	结构组织
3.	抽象设计
4.	模式运用
5.	场景套用


### 第一章：理解架构
### 
    1.1 我们真正会使用jQuery吗？
    1.2 库与框架的区别
    1.3 jQuery对象与dom对象的区别
    1.4 立即表达式
    1.5 模块依赖关系
    1.6 九大重载接口
    1.7 read的加载机制
    1.8 多库共存



###  第二章：核心模块
###  
    2.1 jQuery的无new构建
    2.2 剖析jQuery中的上下文this
    2.3 类数组的结构与实现
    2.4 静态与实例方法的共享设计
    2.5 类型的判断
    2.6 仿队列接口
    2.7 链式调用的实现与优劣
    2.8 回溯处理的设计
    2.10 插件接口的设计
    2.11 钩子机制的设计
    2.12 迭代器的设计
    2.13 归并调用的设计
    2.14 闭包的高级运用
    2.15 设计jQuery的基础原型


###  第三章：回调系统
###  
    3.1 回调用途
    3.2 使用的场景
    3.3 观察者模式的引入
    3.4 一个简单回调实现
    3.5 设计思路
    3.6 jQuery.Callbacks 
        3.6.1 设计的思路
        3.6.2 参数的缓存优化
        3.6.3 add接口的实现
        3.6.4 fire接口的实现
        3.6.5 remove接口的实现


###  第四章：数据缓存
###  
    4.1 缓存介绍
    4.2 一个简单数据缓存实现
    4.3 jQuery引入缓存中解决的问题
    4.4 底层Data类的实现
        4.4.1 set处理
        4.4.2 get处理
        4.4.3 access处理
        4.4.4 remove处理
        4.4.5 hasData处理
    4.5 高层API的封装
        4.5.1 接口的设定 
        4.5.2 HTML5的data-*属性
        4.5.3 缓存检测
    4.6 jQuery.data与data的区别
    4.7 jQuery.data是实现
    4.8 .data的实现
    4.9 缓存的清理
        4.9.1 removeData
        4.9.2 jQuery.removeData
        4.9.3 jQuery.cleanData


###  第五章：异步机制
###  
    5.1 介绍
    5.2 理解同步与异步差别
    5.3 深入定时器
        5.3.1 setTimeout
        5.3.2 setInterval
    5.4 前端的异步接口
    5.5 实际运用中的处理
    5.6 一个简单异步模型的实现
    5.7 原理剖析
    5.8 什么是deferred对象
    5.9 deferred与回调的区别
    5.10 deferred涉及的接口
    5.11 deferred的设计思路及实现
    5.12 when的设计思路及实现


###  第六章：队列操作
###  
    6.1 数据结构中的定义
    6.2 Queue队列
    6.3 为什么要引入队列
    6.4 $.queue
    6.5 $.dequeue
    6.6 promise接口的处理
    6.7 jQuery动画队列的依赖


###  第七章：模块加载
###  
    7.1 AMD与CMD规范
    7.2 设计剖析
        7.2.1 关于require
        7.2.2 关于define
    7.3 构建轻巧的aaronRequire管理器
        7.3.1依赖管理的设计
        7.3.2模块化管理的设计
        7.3.3预加载与懒加载的共存


###  第八章：选择器引擎
###  
    8.1 CSS选择器
    8.1.1 认识CSS选择器
    8.1.2 选择器的种类
    8.2 浏览器提供的接口与兼容问题
        8.2.1 浏览器提供的六大接口
        8.2.2 querySelectorAll的兼容及处理
        8.2.3 getElementById的兼容及处理
        8.2.4 getElementsByTagName的兼容处理
        8.2.5 getElementsByClassName处理
        8.2.6 getAttribute和getAttributeNode的处理
    8.3 正则表达式
        8.4.1 理解正则
        8.4.2 选择分组与引用
        8.4.3 分析jQuery中的正则
    8.4 jQuery选择器的概况
    8.5 选择器引擎设计的思路与知识点 
        8.5.1 浏览器的从右向左的解析
    8.5.2 设计的思路
    8.5.3 需要处理的一些问题
    8.5.4 抽象出的概念
    8.6 详解sizzle引擎
        8.6.1 词法解析器
        8.6.2 解析原理
        8.6.3 编译函数
        8.6.4 超级匹配
        8.6.6 基础选择器
        8.6.7 层级选择器
        8.6.8 属性选择器
        8.6.9 伪类选择器
        8.6.10 过滤器
        8.6.11 表单选择器
    8.7 jQuery选择器的优化


###  第九章：节点遍历
###  
    9.1 节点的关系处理
    9.2 设计思路
    9.3 整体结构
    9.4 抽象的底层处理
         9.4.1 jQuery.dir
         9.4.2 jQuery.sibling
    9.5 .find与.children
    9.6 .prev,.prevAll,prveUntil
    9.7 .next与.nextAll
    9.8 .cloest与parents


###  第十章：文档处理
###  
    10.1 节点层次关系的理解
    10.2 DOM的CRUD操作技术
         10.2.1 创建节点
         10.2.2 插入节点
         10.2.3 删除节点
         10.2.4 替换节点
    10.3 忽略的细节
         10.3.1 Document.body与DocumentElement区别
         10.3.2 contentWindow、contentDocument、document区别
         10.3.3 DocumentFragment存在的问题
         10.3.4 iframe存在的问题
         10.3.5 HTML5引入的高级API
    10.4 jQuery文档整体思路
         10.4.1 参数传递的抽象
         10.4.2 文档碎片的优化
         10.4.3 注入script 处理
    10.5 jQuery 内部插入
         10.5.1 .append与appendTo
    10.5.2 .prepend与.prependTo
         10.5.3 .html与.text
    10.6 jQuery 外部插入
         10.6.1 .before与insertBefore
         10.6.2 .after与insertAfter
    10.7 jQuery 包裹
         10.7.1 .warp
         10.7.2 .warpAll
         10.7.3 .warpInner
    10.8 jQuery 移除
         10.8.1 .empty
         10.8.2 .unwrap
         10.8.3 .detach与.remove
    10.9 jQuery 拷贝
         10.9.1 .clone
    10.10 jQuery 替换 
         10.10.1 .replaceAll和.replaceWith


###  第十一章：样式操作
###  
    11.1 盒子模型
         11.1 padding
         11.2 border
         11.3 margin
    11.2 样式操作的规则
         11.2.1 样式访问接口
         11.2.2 不同浏览下的兼容性
    11.3 样式表操作
    11.4 元素的位置
    11.5 元素的尺寸
    11.6 jQuery样式解析流程
    11.7 jQuery的样式钩子
    11.8 jQuery的css接口
         11.8.1 addClass与hasClass
         11.8.2 removeClass与.toggleClass
    11.9 jQuery的尺寸操作
         11.9.1 .width与.hieght
         11.9.2 .innerWidth与.innerHieght
         11.9.3 .outWidth与.outHieght
    11.10 jQuery的位置操作
          11.10.1 .offset与.offsetParent
          11.10.2 .position
          11.10.3 .scrollLeft与.scrollTop


###  第十二章：属性操作
###  
    12.1 属性与特性
    12.2 浏览器的API
    12.3 关于jQuery属性钩子
    12.4 属性钩子处理的兼容问题
         12.4.1 保留值属性名字修正
         12.4.2 与表单操作相关
    12.5 .attr与.prop
    12.6 .removeAttr与removeProp
    12.7 .val


###  第十三章：事件体系
###  
    13.1 冒泡与捕获
    13.2 事件的异步
    13.3 事件兼容问题及处理
    13.4 事件对象
    13.5 事件引发的循环引用
    13.6 jQuery事件体系结构   
    13.7 jQuery中bind/live/delegate/on的区别
    13.8 jQuery事件对象
         13.8.1 jQuery.Event统一事件对象构件
         13.8.2 jQuery.event.fix修正事件属性
    13.9 jQuery绑定设计
         13.9.1 底层on的设计
         13.9.2 jQuery.event.add
    13.10 jQuery事件移除
          13.10.1 .off
          13.10.2 jQuery.event.remove
    13.11 jQuery委托设计
          13.11.1 涉及的处理
          13.11.2 引入的处理方案
          13.11.3 适配器的运用
    13.12 jQuery自定义事件设计
          13.12.1 了解自定义事件的概念
          13.12.2 jQuery.trigger 与 document.dispatchEvent 区分
          13.12.3 jQuery自定义事件原理
    13.13 trigger的几种常见用法
          13.13.1 常用模拟
          13.13.2 触发自定义事件
          13.13.3 传递数据
          13.13.4 执行默认操作
          13.14.5 trigger需要处理的问题
    13.14 trigger源码解读
          13.14.1 命名空间的过滤
          13.14.2 模拟事件对象
          13.14.3 返回的事件数据合集
          13.14.4 jQuery.event.special
          13.14.5 模拟事件冒泡
          13.14.6 处理事件  
    13.15 jQuery模拟事件 
          13.15.1 焦点事件
          13.15.2 事件的兼容性支持
          13.15.3 jQuery.event.special方法
          13.15.4 jQuery.event 事件机制 focusin/ focusout 事件
          13.15.5 为什么用捕获？
          13.15.6 jQuery.event.simulate方法


###  第十四章：AJAX交互
###  
    14.1 关于XMLHttpRequest对象
         14.1.1 关于post
         14.1.2 关于get
    14.2 http协议
    14.3 数据处理
    14.4 实现一个完整的Ajax
    14.5 jQuery.ajax做了那些事？
    14.6 jQuery针对ajax的全新设计
         14.6.1 整体的结构设计
         14.6.2 引入的机制与实现
         14.6.3 抽象的接口
    14.7 jQuery.ajax三种事件消息机制
         14.7.1 ajax的参数回调
         14.7.2基于deferred方式的done回调
         14.7.3全局的的自定义事件的回调
    14.8 Deferred与Callback的改造
         14.8.1 Callback
         14.8.2 Ajax deferred实现
    14.9 前置过滤器
         14.9.1 引入的作用
         14.9.2 针对script的预处理
         14.9.3 针对json,jsonp的预处理
    14.10 请求分发器
          14.10.1 XHR对象的封装
    14.11 jsonp的跨域
    14.12 jsonp的原理与实现
    14.13 类型转化器
    14.14 小结


###  第十五章：动画引擎
###  
    15.1 常见动画手段
         15.1.1 定时器动画
         15.1.2 CSS3动画
         15.1.3 transition动画
    15.2 动画原理
    15.3 关于缓动公式
    15.4 实现一个简单的动画设计
    15.5 jQuery动画的引擎
    15.6 jQuery动画队列
    15.7 基于队列动画调用
    15.8 动画的底层实现类
         15.8.1 基于deferred的设计
         15.8.2 动画的开始
         15.8.3 动画的停止
    15.9 jQuery基本动画效果  
         15.9.1 show
         15.9.2 hide
         15.9.3 toogle
    15.10 jQuery动画的渐变
          15.10.1 .fadeIn和fadeOut
          15.10.2 .fadeTo和fadeToggle
    15.11 jQuery动画的滑动
          15.11.1 .slideDown
          15.11.2 .slideToggle
          15.11.3 .slideUp


	
-----------------------------------

