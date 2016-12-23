  
jQuery架构设计与实现（2.1.4版本）
-----------------------------------

市面上的jQuery书太多了,良莠不齐,看了那么多总觉得少点什么
对"干货"，我不喜欢就事论事的写代码,我想把自己所学的知识点，代码技巧，设计思想，代码模式能很好的表达出来,所以考虑通过分析jQuery的源码库的方式来表达，尽力做最好
内容结构还在不断的修正，欢迎给出建议


ps：写了数万字，因项目太忙，暂停下

###  本书围绕的几个核心点：
1.    设计理念
2.	结构组织
3.	抽象设计
4.	模式运用
5.	场景套用


### 第一章：理解架构
### 
    1.1 我们真正会使用jQuery吗？
    1.2 库与框架的区别
    1.3 jQuery对象与dom对象的区别
    1.4 立即表达式与工厂模式
    1.5 无冲突处理机制


###  第二章：核心机制(完成)
###  
    2.1 理解上下文this
        2.1.1 作为对象方法调用
        2.1.2 作为函数调用
        2.1.3 作为apply 或 call 调用
        2.1.4 作为构造函数
    2.2 原型的优与弊
    2.3 架构设计
        2.3.1 new操作符
        2.3.2 实例的检测
        2.3.3 构造器
        2.3.4 此jQuery非彼jQuery
        2.3.5 合并构造器
    2.4 实例对象
        2.4.1 对象结构
        2.4.2 生成原理
    2.5 实例与静态共享设计
    2.6 链式调用的原理
    2.7 回溯机制
        2.7.1 上下文切换
        2.7.2 回溯原理
    2.8 插件机制
        2.8.1 枚举属性
        2.8.2 extend机制
    2.9 迭代器模式
        2.9.1 简单的迭代器
        2.9.2 jQuery中的each迭代器
        2.9.4 迭代器的扩展  
        2.9.3 迭代器模式总结
    2.10 本章总结


###  第三章：回调模型(完成)
###  
    3.1 理解回调函数
    3.2 同步与异步中的回调函数
    3.3 回调函数与设计模式
    3.6 观察者模式
        3.6.1 模式定义
        3.6.2 适用场合
        3.6.3 简单实现
        3.6.4 实现原理
        3.6.5 模式利与弊
        3.6.6 模式的运用
    3.7 $.Callbacks
        3.7.1 简单使用
        3.7.2 结构设计
        3.7.3 执行流程
        3.7.4 组合模式


###  第四章：异步编程(完成)
###  
    4.1 异步编程原理
    4.2 定时器的困惑
    4.3 定时器的工作原理
    4.4 setTimeout和setInterval的本质区别
    4.5 万能的setTimeout(0)
        4.5.1 setTimeout(0)的作用
        4.5.2 setTimeout(0)真正意义
        4.5.3 setTimeout(0)的替代品
    4.6 浏览器的线程机制
    4.6 异步回调与Promise
        4.7.1 嵌套异步
        4.7.2 Promise异步
    4.8 Promise 与Promise/A+规范
        4.8.1 Promise的世界
        4.8.2 生活中的Promise
        4.8.3 理解Promise的重点
        4.8.4 有限状态机
        4.8.5 ECMAScript 6中的Promise
        4.8.6 PromiseA与Promise A+的主要区别
        4.8.7 jQuery中Promise？
    4.9 Promise的设计路程
        4.9.1 创建Promise
        4.9.2 引入状态机
        4.9.3 Promise职责分离
        4.9.4 串联Promise
        4.9.5 错误处理
        4.9.6 融入异步
    4.10 jQuery的Deferred
        4.10.1 Deferred设计的初衷
        4.10.2 Deferred与Promise
        4.10.3 Deferred.promise
        4.10.4 Deferred的接口设计
        4.10.5 Deferred的执行原理
        4.10.6 Deferred的管道设计
        4.10.7 Deferred的并归设计


###  第五章：数据缓存
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

