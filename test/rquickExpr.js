/**
 * 这个表达式用于匹配ID，标签，类选择器
 * @type {RegExp}
 *
 *  ()
 *    1 单独的项组合字表达式
 *    2 定义子模式
 *    3 同一个表达式引用之前的字表达式
 *    4 (?:)分组
 *
 */
var rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;


/*
 1 分组不记忆该组相匹配的字符
 2 [^#<]* 匹配除去^#<字符中0次或多次 {0,} 也就是不匹配这3种情况开头
	例如：rquickExpr.exec('<div>')
			  				["<div>", "<div>", undefined, index: 0, input: "<div>"]


 */

rquickExpr.exec('word _$space<tag>word$ _ space');
rquickExpr.exec('word _$space<tag id="id" class="name">word$ _ space</tag>');
rquickExpr.exec('#idSelector');

console.log(
	rquickExpr.exec('#idSelector')
	)