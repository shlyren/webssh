
var isAndroid = !!navigator.userAgent.match(/Android/i);
var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端 ;

// 是否是移动端
function isMobile() {
  return isiOS || isAndroid;  
}

if (isMobile()) {
    document.writeln("<style>.terminal {font-size: 10px;}</style>")
}